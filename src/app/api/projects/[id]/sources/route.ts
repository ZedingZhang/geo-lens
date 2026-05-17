import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withRateLimit } from "@/lib/security/rate-limit";
import { callLLM } from "@/lib/llm/client";
import { CitationSourceMapResponseSchema } from "@/lib/llm/schemas";
import { buildSourceMapPrompt } from "@/lib/llm/prompts";
import { MOCK_SOURCE_MAP } from "@/lib/mock-data";
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

    const competitors = parseJsonField<string[]>(project.competitors || null, []);

    const prompt = buildSourceMapPrompt({
      brandName: project.brandName,
      websiteUrl: project.websiteUrl || undefined,
      description: project.description,
      competitors,
    });

    const mockSources = { sources: MOCK_SOURCE_MAP };
    const result = await callLLM(prompt, CitationSourceMapResponseSchema, mockSources);

    await prisma.citationSource.deleteMany({ where: { projectId: id } });

    const sources = await Promise.all(
      result.data.sources.map((s) =>
        prisma.citationSource.create({
          data: {
            projectId: id,
            category: s.category,
            coverage: s.coverage,
            influence: s.influence,
            gap: s.gap,
            recommendedStrategies: JSON.stringify(s.recommendedStrategies),
            resultSource: result.source,
          },
        })
      )
    );

    return NextResponse.json({ sources, resultSource: result.source });
  } catch (error) {
    console.error("Source map failed:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Failed to generate source map. Please try again." },
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
    const sources = await prisma.citationSource.findMany({
      where: { projectId: id },
      orderBy: { category: "asc" },
    });

    const formatted = sources.map((s) => ({
      ...s,
      recommendedStrategies: parseJsonField(s.recommendedStrategies, []),
    }));

    return NextResponse.json({ sources: formatted });
  } catch (error) {
    console.error("Failed to get sources:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Failed to get sources" }, { status: 500 });
  }
}
