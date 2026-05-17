import { getEnv } from "@/lib/env";
import { createHash } from "node:crypto";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function hashIP(ip: string): string {
  return createHash("sha256").update(ip + "geo-lens-salt").digest("hex").slice(0, 16);
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const key = hashIP(ip);
  const now = Date.now();
  const limit = getEnv().RATE_LIMIT_PER_HOUR;
  const windowMs = 60 * 60 * 1000;

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;
  return "127.0.0.1";
}

export function withRateLimit(request: Request): Response | null {
  if (!getEnv().DEMO_MODE) {
    const ip = getClientIP(request);
    const result = checkRateLimit(ip);

    if (!result.allowed) {
      return Response.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }
  }

  return null;
}
