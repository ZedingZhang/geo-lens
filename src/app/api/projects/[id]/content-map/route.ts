import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { assertProjectAccess } from "@/lib/demo/access";
import { parseJsonField } from "@/lib/utils";
import { buildMissingContentMap } from "@/lib/geo/missing-content-map";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const access = await assertProjectAccess(request, id);
    if (!access.allowed) return access.response;

    const project = access.project as typeof access.project & {
      id: string;
      brandName: string;
      websiteUrl: string | null;
      description: string;
      product: string;
      keywords: string;
      competitors: string | null;
    };

    const [latestAnalysis, latestReadinessAudit, diagnoses, questions] =
      await Promise.all([
        prisma.analysis.findFirst({
          where: { projectId: id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.readinessAudit.findFirst({
          where: { projectId: id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.citationFailure.findMany({
          where: { projectId: id },
          orderBy: { createdAt: "desc" },
          take: 12,
        }),
        prisma.simulatedQuestion.findMany({
          where: { projectId: id },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
      ]);

    const readinessChecks = latestReadinessAudit
      ? parseJsonField<Array<{ key: string; label: string; status: string }>>(
          latestReadinessAudit.checks,
          []
        )
      : [];

    return NextResponse.json(
      buildMissingContentMap({
        brandName: project.brandName,
        websiteUrl: project.websiteUrl,
        description: project.description,
        product: project.product,
        keywords: project.keywords,
        competitors: project.competitors,
        scores: latestAnalysis
          ? {
              entityClarity: latestAnalysis.entityClarity,
              answerCoverage: latestAnalysis.answerCoverage,
              citationReadiness: latestAnalysis.citationReadiness,
              contentStructure: latestAnalysis.contentStructure,
              freshnessSignal: latestAnalysis.freshnessSignal,
            }
          : null,
        diagnoses,
        readinessChecks,
        questions,
      })
    );
  } catch (error) {
    console.error(
      "Missing content map failed:",
      error instanceof Error ? error.name : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to generate missing content map" },
      { status: 500 }
    );
  }
}
