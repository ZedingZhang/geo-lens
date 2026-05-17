import { NextResponse } from "next/server";
import { STRATEGY_LIBRARY } from "@/lib/geo/strategies";

export async function GET() {
  return NextResponse.json({ strategies: STRATEGY_LIBRARY });
}
