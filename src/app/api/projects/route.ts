import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withRateLimit, getClientIP, hashIP } from "@/lib/security/rate-limit";
import { getEnv } from "@/lib/env";
import { z } from "zod";
import { canCreateProject, getExpiresAt, generateSessionHash } from "@/lib/demo/session";

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  brandName: z.string().min(1).max(100),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().min(1).max(2000),
  audience: z.string().min(1).max(500),
  product: z.string().min(1).max(500),
  keywords: z.array(z.string().max(50)).min(1).max(10),
  competitors: z.array(z.string().max(100)).max(5).optional(),
});

export async function GET(request: NextRequest) {
  const rateLimitResponse = withRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const isDemo = getEnv().DEMO_MODE;
    const sessionHash = isDemo ? request.cookies.get("geo_lens_demo_session")?.value : undefined;

    const projects = await prisma.project.findMany({
      where: sessionHash
        ? { demoSessionHash: sessionHash }
        : { isSample: false },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        analyses: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Failed to list projects:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Failed to list projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = withRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const isDemo = getEnv().DEMO_MODE;
    let demoSessionHash: string | null = null;

    if (isDemo) {
      demoSessionHash = request.cookies.get("geo_lens_demo_session")?.value || generateSessionHash();

      const canCreate = await canCreateProject(demoSessionHash);
      if (!canCreate) {
        return NextResponse.json(
          { error: `Demo mode: max ${getEnv().MAX_PROJECTS_PER_DEMO_SESSION} projects per session` },
          { status: 403 }
        );
      }
    }

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        brandName: parsed.data.brandName,
        websiteUrl: parsed.data.websiteUrl || null,
        description: parsed.data.description,
        audience: parsed.data.audience,
        product: parsed.data.product,
        keywords: JSON.stringify(parsed.data.keywords),
        competitors: parsed.data.competitors?.length
          ? JSON.stringify(parsed.data.competitors)
          : null,
        demoSessionHash,
        expiresAt: isDemo ? getExpiresAt() : null,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
