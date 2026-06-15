import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { assertProjectAccess } from "@/lib/demo/access";
import { generateExperimentMarkdown } from "@/lib/geo/experiment-loop";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; experimentId: string }> }
) {
  try {
    const { id, experimentId } = await params;
    const access = await assertProjectAccess(request, id);
    if (!access.allowed) return access.response;

    const project = await prisma.project.findUnique({
      where: { id },
      select: { name: true, brandName: true },
    });
    const experiment = await prisma.geoExperiment.findUnique({
      where: { id: experimentId },
    });

    if (!project || !experiment || experiment.projectId !== id) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    return NextResponse.json({
      markdown: generateExperimentMarkdown({
        projectName: project.name,
        brandName: project.brandName,
        experiment,
      }),
      experiment,
    });
  } catch (error) {
    console.error(
      "Experiment report failed:",
      error instanceof Error ? error.name : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to generate experiment report" },
      { status: 500 }
    );
  }
}
