import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withRateLimit } from "@/lib/security/rate-limit";
import { callLLM } from "@/lib/llm/client";
import { PromptPortfolioResponseSchema } from "@/lib/llm/schemas";
import { buildPromptPortfolioPrompt } from "@/lib/llm/prompts";
import { MOCK_PROMPT_PORTFOLIO } from "@/lib/mock-data";
import { parseJsonField } from "@/lib/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = withRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const keywords = parseJsonField<string[]>(project.keywords, []);
    const competitors = parseJsonField<string[]>(project.competitors || null, []);

    const prompt = buildPromptPortfolioPrompt({
      brandName: project.brandName,
      description: project.description,
      audience: project.audience,
      product: project.product,
      keywords,
      competitors,
    });

    const mockPrompts = { prompts: MOCK_PROMPT_PORTFOLIO };
    const result = await callLLM(prompt, PromptPortfolioResponseSchema, mockPrompts);

    await prisma.promptItem.deleteMany({ where: { projectId: id } });

    const prompts = await Promise.all(
      result.data.prompts.map((p) =>
        prisma.promptItem.create({
          data: {
            projectId: id,
            prompt: p.prompt,
            intentType: p.intentType,
            funnelStage: p.funnelStage,
            priority: p.priority,
            targetKeyword: p.targetKeyword || null,
            expectedBrands: JSON.stringify(p.expectedBrands),
            demandScore: p.demandScore,
            resultSource: result.source,
          },
        })
      )
    );

    return NextResponse.json({ prompts, resultSource: result.source });
  } catch (error) {
    console.error("Prompt portfolio failed:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Failed to generate prompts. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prompts = await prisma.promptItem.findMany({
      where: { projectId: id },
      orderBy: { demandScore: "desc" },
    });

    const formatted = prompts.map((p) => ({
      ...p,
      expectedBrands: parseJsonField(p.expectedBrands, []),
    }));

    return NextResponse.json({ prompts: formatted });
  } catch (error) {
    console.error("Failed to get prompts:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Failed to get prompts" }, { status: 500 });
  }
}
