import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { getEnv } from "@/lib/env";
import type { NextRequest } from "next/server";

export const DEMO_SESSION_COOKIE = "geo_lens_demo_session";

export function createDemoSessionHash(): string {
  return createHash("sha256")
    .update(Date.now().toString() + Math.random().toString())
    .digest("hex")
    .slice(0, 16);
}

export interface SessionCookieOptions {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  maxAge: number;
  path: string;
}

export function getDemoCookieOptions(
  hash: string
): SessionCookieOptions {
  const days = getEnv().DEMO_DATA_RETENTION_DAYS;
  return {
    name: DEMO_SESSION_COOKIE,
    value: hash,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: days * 24 * 60 * 60,
    path: "/",
  };
}

export async function getOrCreateDemoSessionFromRequest(
  request: NextRequest
): Promise<{ sessionHash: string; shouldSetCookie: boolean }> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(DEMO_SESSION_COOKIE);

  if (existing?.value) {
    return { sessionHash: existing.value, shouldSetCookie: false };
  }

  // Also check the request cookies directly (for API routes)
  const reqCookie = request.cookies.get(DEMO_SESSION_COOKIE);
  if (reqCookie?.value) {
    return { sessionHash: reqCookie.value, shouldSetCookie: false };
  }

  const hash = createDemoSessionHash();
  return { sessionHash: hash, shouldSetCookie: true };
}

export function getSessionWhereClause(
  isDemo: boolean,
  sessionHash: string | null
): Record<string, unknown> {
  if (!isDemo || !sessionHash) return {};
  return {
    OR: [{ demoSessionHash: sessionHash }, { isSample: true }],
  };
}

export async function canCreateProject(sessionHash: string): Promise<boolean> {
  const { prisma } = await import("@/lib/db");
  const max = getEnv().MAX_PROJECTS_PER_DEMO_SESSION;
  const count = await prisma.project.count({
    where: { demoSessionHash: sessionHash },
  });
  return count < max;
}

export function getExpiresAt(): Date {
  const days = getEnv().DEMO_DATA_RETENTION_DAYS;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
