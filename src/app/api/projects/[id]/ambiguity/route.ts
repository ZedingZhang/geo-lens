import { NextRequest, NextResponse } from "next/server";
import { assertProjectAccess } from "@/lib/demo/access";
import { buildBrandAmbiguityResult } from "@/lib/geo/brand-ambiguity";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const access = await assertProjectAccess(request, id);
    if (!access.allowed) return access.response;

    const project = access.project as typeof access.project & {
      brandName: string;
      websiteUrl: string | null;
      description: string;
      product: string;
      keywords: string;
      competitors: string | null;
    };

    return NextResponse.json(
      buildBrandAmbiguityResult({
        brandName: project.brandName,
        websiteUrl: project.websiteUrl,
        description: project.description,
        product: project.product,
        keywords: project.keywords,
        competitors: project.competitors,
      })
    );
  } catch (error) {
    console.error(
      "Brand ambiguity detection failed:",
      error instanceof Error ? error.name : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to detect brand ambiguity" },
      { status: 500 }
    );
  }
}
