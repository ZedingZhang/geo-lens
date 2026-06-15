import { NextRequest, NextResponse } from "next/server";
import { assertProjectAccess } from "@/lib/demo/access";
import { buildModelVisibilityDemo } from "@/lib/geo/model-visibility";

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

    return NextResponse.json(buildModelVisibilityDemo(project));
  } catch (error) {
    console.error(
      "Model visibility demo failed:",
      error instanceof Error ? error.name : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to generate model visibility demo" },
      { status: 500 }
    );
  }
}
