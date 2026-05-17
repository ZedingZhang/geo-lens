import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { createHash } from "node:crypto";
import prisma from "@/lib/db";

const memoryStore = new Map<string, { count: number; resetAt: number }>();

export function hashIP(ip: string): string {
  return createHash("sha256")
    .update(ip + "geo-lens-salt-2026")
    .digest("hex")
    .slice(0, 16);
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;
  return "127.0.0.1";
}

function checkMemory(
  ipHashed: string,
  limit: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const entry = memoryStore.get(ipHashed);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(ipHashed, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export async function enforceRateLimit(
  request: NextRequest,
  action: string
): Promise<NextResponse | null> {
  const limit = getEnv().RATE_LIMIT_PER_HOUR;
  const mode = getEnv().DEMO_MODE ? "demo" : "live";
  const ip = getClientIP(request);
  const ipHashed = hashIP(ip);

  // Try DB-based window counting first
  try {
    const windowStart = new Date(Date.now() - 60 * 60 * 1000);
    const count = await prisma.usageEvent.count({
      where: { ipHash: ipHashed, action, createdAt: { gte: windowStart } },
    });

    if (count >= limit) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    await prisma.usageEvent.create({
      data: { ipHash: ipHashed, action, mode },
    });
  } catch {
    // DB unavailable: fall back to memory store
    const result = checkMemory(ipHashed, limit);
    if (!result.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)) },
        }
      );
    }
  }

  return null;
}
