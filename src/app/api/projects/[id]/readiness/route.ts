import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withRateLimit } from "@/lib/security/rate-limit";
import { callLLM } from "@/lib/llm/client";
import { ReadinessAuditResponseSchema } from "@/lib/llm/schemas";
import { buildReadinessAuditPrompt } from "@/lib/llm/prompts";
import { MOCK_READINESS_AUDIT } from "@/lib/mock-data";

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

    const prompt = buildReadinessAuditPrompt(project.websiteUrl, {
      brandName: project.brandName,
      description: project.description,
    });

    const result = await callLLM(
      prompt,
      ReadinessAuditResponseSchema,
      MOCK_READINESS_AUDIT
    );

    await prisma.readinessAudit.deleteMany({ where: { projectId: id } });

    const audit = await prisma.readinessAudit.create({
      data: {
        projectId: id,
        totalScore: result.data.totalScore,
        checks: JSON.stringify(result.data.checks),
        summary: result.data.summary,
        rawJson: result.source === "live" ? JSON.stringify(result.data) : null,
        resultSource: result.source,
      },
    });

    return NextResponse.json({ audit, resultSource: result.source });
  } catch (error) {
    console.error("Readiness audit failed:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Failed to run readiness audit. Please try again." },
      { status: 500 }
    );
  }
}
