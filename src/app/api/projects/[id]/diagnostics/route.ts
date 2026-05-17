import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { assertProjectWriteAccess } from "@/lib/demo/access";
import { callLLM } from "@/lib/llm/client";
import { CitationFailureResponseSchema } from "@/lib/llm/schemas";
import { buildDiagnosticsPrompt } from "@/lib/llm/prompts";
import { MOCK_DIAGNOSTICS } from "@/lib/mock-data";
import { parseJsonField } from "@/lib/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await enforceRateLimit(request, "diagnostics");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { id } = await params;
    const access = await assertProjectWriteAccess(request, id);
    if (!access.allowed) return access.response;
    const project = access.project as typeof access.project & {
      brandName: string; description: string;
    };

    const latestAnalysis = await prisma.analysis.findFirst({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });

    const existingQuestions = await prisma.simulatedQuestion.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    const prompt = buildDiagnosticsPrompt({
      brandName: project.brandName,
      description: project.description,
      scores: {
        entityClarity: latestAnalysis?.entityClarity ?? 50,
        answerCoverage: latestAnalysis?.answerCoverage ?? 50,
        citationReadiness: latestAnalysis?.citationReadiness ?? 50,
        contentStructure: latestAnalysis?.contentStructure ?? 50,
        freshnessSignal: latestAnalysis?.freshnessSignal ?? 50,
      },
      questions: existingQuestions.map((q) => ({
        question: q.question,
        brandMentioned: q.brandMentioned,
        simulatedAnswer: q.simulatedAnswer,
      })),
    });

    const mockDiagnostics = { failures: MOCK_DIAGNOSTICS };
    const result = await callLLM(prompt, CitationFailureResponseSchema, mockDiagnostics);

    await prisma.citationFailure.deleteMany({ where: { projectId: id } });

    const diagnoses = await Promise.all(
      result.data.failures.map((f) =>
        prisma.citationFailure.create({
          data: {
            projectId: id,
            failureType: f.failureType,
            severity: f.severity,
            evidence: f.evidence,
            reason: f.reason,
            fix: f.fix,
            impactedDimension: f.impactedDimension,
            relatedQuestionId: null,
            resultSource: result.source,
          },
        })
      )
    );

    return NextResponse.json({ diagnoses, resultSource: result.source });
  } catch (error) {
    console.error("Diagnostics failed:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Failed to run diagnostics. Please try again." },
      { status: 500 }
    );
  }
}
