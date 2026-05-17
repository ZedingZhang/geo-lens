import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { assertProjectWriteAccess } from "@/lib/demo/access";
import { callLLM } from "@/lib/llm/client";
import { GeoAnalysisSchema } from "@/lib/llm/schemas";
import { buildGeoAnalysisPrompt } from "@/lib/llm/prompts";
import { MOCK_GEO_ANALYSIS } from "@/lib/mock-data";
import { parseJsonField } from "@/lib/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await enforceRateLimit(request, "analyze");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { id } = await params;
    const access = await assertProjectWriteAccess(request, id);
    if (!access.allowed) return access.response;
    const project = access.project as typeof access.project & {
      name: string; brandName: string; description: string; audience: string;
      product: string; keywords: string; competitors: string | null;
    };

    const keywords = parseJsonField<string[]>(project.keywords, []);
    const competitors = parseJsonField<string[]>(project.competitors || null, []);

    const prompt = buildGeoAnalysisPrompt({
      name: project.name,
      brandName: project.brandName,
      description: project.description,
      audience: project.audience,
      product: project.product,
      keywords,
      competitors,
    });

    const result = await callLLM(prompt, GeoAnalysisSchema, MOCK_GEO_ANALYSIS);

    const analysis = await prisma.analysis.create({
      data: {
        projectId: id,
        totalScore: result.data.totalScore,
        entityClarity: result.data.scores.entityClarity,
        answerCoverage: result.data.scores.answerCoverage,
        citationReadiness: result.data.scores.citationReadiness,
        contentStructure: result.data.scores.contentStructure,
        freshnessSignal: result.data.scores.freshnessSignal,
        strengths: JSON.stringify(result.data.strengths),
        weaknesses: JSON.stringify(result.data.weaknesses),
        nextActions: JSON.stringify(result.data.nextActions),
        rawJson: result.source === "live" ? JSON.stringify(result.data) : null,
        resultSource: result.source,
      },
    });

    return NextResponse.json({ analysis, resultSource: result.source });
  } catch (error) {
    console.error("Analysis failed:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
