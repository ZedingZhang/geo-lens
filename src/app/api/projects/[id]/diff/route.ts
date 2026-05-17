import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { assertProjectWriteAccess } from "@/lib/demo/access";
import { callLLM } from "@/lib/llm/client";
import { ContentDiffSchema } from "@/lib/llm/schemas";
import { buildDiffPrompt } from "@/lib/llm/prompts";
import { MOCK_DIFF } from "@/lib/mock-data";

export async function POST(request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await enforceRateLimit(request, "diff");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { id } = await params;
    const access = await assertProjectWriteAccess(request, id);
    if (!access.allowed) return access.response;
    const project = access.project as typeof access.project & { description: string };

    const body = await request.json().catch(() => ({}));
    const originalContent = body.content || project.description;
    const strategyName = body.strategy || "Citable Summary + Entity Definition";

    const prompt = buildDiffPrompt(originalContent, strategyName);
    const result = await callLLM(prompt, ContentDiffSchema, MOCK_DIFF);

    const diff = await prisma.contentDiff.create({
      data: {
        projectId: id,
        sourceLabel: result.data.sourceLabel,
        beforeContent: result.data.beforeContent,
        afterContent: result.data.afterContent,
        changeSummary: JSON.stringify(result.data.changeSummary),
        rationale: result.data.rationale,
        impactedDimensions: JSON.stringify(result.data.impactedDimensions),
        addedElements: JSON.stringify(result.data.addedElements),
        resultSource: result.source,
      },
    });

    return NextResponse.json({ diff, resultSource: result.source });
  } catch (error) {
    console.error("Diff failed:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Failed to generate diff. Please try again." },
      { status: 500 }
    );
  }
}
