import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { assertProjectWriteAccess } from "@/lib/demo/access";
import { callLLM } from "@/lib/llm/client";
import { QuestionsResponseSchema } from "@/lib/llm/schemas";
import { buildQuestionsPrompt } from "@/lib/llm/prompts";
import { MOCK_QUESTIONS } from "@/lib/mock-data";
import { parseJsonField } from "@/lib/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await enforceRateLimit(request, "questions");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { id } = await params;
    const access = await assertProjectWriteAccess(request, id);
    if (!access.allowed) return access.response;
    const project = access.project as typeof access.project & {
      brandName: string; description: string; product: string; keywords: string; competitors: string | null;
    };

    const keywords = parseJsonField<string[]>(project.keywords, []);
    const competitors = parseJsonField<string[]>(project.competitors || null, []);

    const prompt = buildQuestionsPrompt({
      brandName: project.brandName,
      description: project.description,
      product: project.product,
      keywords,
      competitors,
    });

    const mockQuestions = { questions: MOCK_QUESTIONS };
    const result = await callLLM(prompt, QuestionsResponseSchema, mockQuestions);

    // Delete old questions and save new ones
    await prisma.simulatedQuestion.deleteMany({ where: { projectId: id } });

    const questions = await Promise.all(
      result.data.questions.map((q) =>
        prisma.simulatedQuestion.create({
          data: {
            projectId: id,
            question: q.question,
            intent: q.intent,
            simulatedAnswer: q.simulatedAnswer,
            brandMentioned: q.brandMentioned,
            mentionReason: q.mentionReason,
            improvement: q.improvement,
            resultSource: result.source,
          },
        })
      )
    );

    return NextResponse.json({ questions, resultSource: result.source });
  } catch (error) {
    console.error("Questions failed:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Failed to generate questions. Please try again." },
      { status: 500 }
    );
  }
}
