import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { assertProjectAccess } from "@/lib/demo/access";
import { generateMarkdownReport } from "@/lib/report/markdown";
import { parseJsonField } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const access = await assertProjectAccess(request, id);
    if (!access.allowed) return access.response;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        analyses: { orderBy: { createdAt: "desc" }, take: 1 },
        questions: { orderBy: { createdAt: "desc" }, take: 8 },
        recommendations: { orderBy: { createdAt: "desc" }, take: 10 },
        diagnoses: { orderBy: { createdAt: "desc" }, take: 6 },
        contentDiffs: { orderBy: { createdAt: "desc" }, take: 1 },
        readinessAudits: { orderBy: { createdAt: "desc" }, take: 1 },
        promptItems: { orderBy: { createdAt: "desc" }, take: 12 },
        sourceMaps: { orderBy: { createdAt: "desc" }, take: 8 },
        experiments: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const markdown = generateMarkdownReport(project);

    return NextResponse.json({
      markdown,
      project: {
        ...project,
        keywords: parseJsonField(project.keywords, []),
      },
    });
  } catch (error) {
    console.error("Report failed:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
