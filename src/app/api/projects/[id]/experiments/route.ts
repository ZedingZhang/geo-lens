import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { parseJsonField } from "@/lib/utils";
import { computeDelta } from "@/lib/geo/experiments";
import { z } from "zod";

const createExperimentSchema = z.object({
  name: z.string().min(1).max(200),
  strategyId: z.string().optional(),
  baselineScore: z.number().int().min(0).max(100).optional(),
  impactedDimensions: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = createExperimentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const experiment = await prisma.geoExperiment.create({
      data: {
        projectId: id,
        name: parsed.data.name,
        strategyId: parsed.data.strategyId || null,
        status: "planned",
        baselineScore: parsed.data.baselineScore || null,
        impactedDimensions: JSON.stringify(parsed.data.impactedDimensions || []),
        notes: parsed.data.notes || null,
      },
    });

    return NextResponse.json({ experiment }, { status: 201 });
  } catch (error) {
    console.error("Failed to create experiment:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Failed to create experiment" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const experiments = await prisma.geoExperiment.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });

    const formatted = experiments.map((e) => ({
      ...e,
      impactedDimensions: parseJsonField(e.impactedDimensions, []),
    }));

    return NextResponse.json({ experiments: formatted });
  } catch (error) {
    console.error("Failed to get experiments:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Failed to get experiments" },
      { status: 500 }
    );
  }
}
