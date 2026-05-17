import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { computeDelta } from "@/lib/geo/experiments";
import { z } from "zod";

const updateExperimentSchema = z.object({
  status: z.enum(["planned", "running", "completed", "archived"]).optional(),
  afterScore: z.number().int().min(0).max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; experimentId: string }> }
) {
  try {
    const { id, experimentId } = await params;
    const body = await request.json();
    const parsed = updateExperimentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.geoExperiment.findUnique({
      where: { id: experimentId },
    });

    if (!existing || existing.projectId !== id) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.status) {
      updateData.status = parsed.data.status;
      if (parsed.data.status === "completed") {
        updateData.completedAt = new Date();
      }
    }
    if (parsed.data.afterScore !== undefined) {
      updateData.afterScore = parsed.data.afterScore;
      updateData.delta = computeDelta(
        existing.baselineScore,
        parsed.data.afterScore
      );
    }
    if (parsed.data.notes !== undefined) {
      updateData.notes = parsed.data.notes;
    }

    const experiment = await prisma.geoExperiment.update({
      where: { id: experimentId },
      data: updateData,
    });

    return NextResponse.json({ experiment });
  } catch (error) {
    console.error("Failed to update experiment:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Failed to update experiment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; experimentId: string }> }
) {
  try {
    const { id, experimentId } = await params;

    const existing = await prisma.geoExperiment.findUnique({
      where: { id: experimentId },
    });

    if (!existing || existing.projectId !== id) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    await prisma.geoExperiment.delete({ where: { id: experimentId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete experiment:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Failed to delete experiment" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; experimentId: string }> }
) {
  try {
    const { experimentId } = await params;
    const experiment = await prisma.geoExperiment.findUnique({
      where: { id: experimentId },
    });

    if (!experiment) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    return NextResponse.json({ experiment });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get experiment" },
      { status: 500 }
    );
  }
}
