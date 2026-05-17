import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredDemoData } from "@/lib/demo/cleanup";
import { getEnv } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const secret = getEnv().CRON_SECRET;

    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await cleanupExpiredDemoData();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cleanup failed:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
