import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { assertProjectWriteAccess } from "@/lib/demo/access";
import { callLLM } from "@/lib/llm/client";
import { RecommendationsResponseSchema } from "@/lib/llm/schemas";
import { buildRecommendationsPrompt } from "@/lib/llm/prompts";
import { MOCK_RECOMMENDATIONS } from "@/lib/mock-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await enforceRateLimit(request, "recommendations");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { id } = await params;
    const access = await assertProjectWriteAccess(request, id);
    if (!access.allowed) return access.response;
    const project = access.project as typeof access.project & {
      brandName: string; description: string; audience: string; product: string;
    };

    const existingQuestions = await prisma.simulatedQuestion.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    const prompt = buildRecommendationsPrompt({
      brandName: project.brandName,
      description: project.description,
      audience: project.audience,
      product: project.product,
      questions: existingQuestions.map((q) => ({
        question: q.question,
        brandMentioned: q.brandMentioned,
        improvement: q.improvement,
      })),
    });

    const mockRecs = { recommendations: MOCK_RECOMMENDATIONS };
    const result = await callLLM(prompt, RecommendationsResponseSchema, mockRecs);

    await prisma.recommendation.deleteMany({ where: { projectId: id } });

    const recommendations = await Promise.all(
      result.data.recommendations.map((r) =>
        prisma.recommendation.create({
          data: {
            projectId: id,
            type: r.type,
            title: r.title,
            content: r.content,
            priority: r.priority,
            resultSource: result.source,
          },
        })
      )
    );

    return NextResponse.json({ recommendations, resultSource: result.source });
  } catch (error) {
    console.error("Recommendations failed:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Failed to generate recommendations. Please try again." },
      { status: 500 }
    );
  }
}
