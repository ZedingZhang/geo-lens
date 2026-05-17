import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { parseJsonField } from "@/lib/utils";
import { assertProjectAccess, assertProjectWriteAccess } from "@/lib/demo/access";

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

    return NextResponse.json({
      project: {
        ...project,
        keywords: parseJsonField(project.keywords, []),
        competitors: parseJsonField(project.competitors, []),
      },
    });
  } catch (error) {
    console.error("Failed to get project:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Failed to get project" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const access = await assertProjectWriteAccess(request, id);
    if (!access.allowed) return access.response;

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete project:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
