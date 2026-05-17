import { cookies } from "next/headers";
import { createHash } from "crypto";
import { getEnv } from "@/lib/env";

const SESSION_COOKIE = "geo_lens_demo_session";

export async function getDemoSessionHash(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE);

  if (existing?.value) {
    return existing.value;
  }

  const hash = createHash("sha256")
    .update(Date.now().toString() + Math.random().toString())
    .digest("hex")
    .slice(0, 16);

  return hash;
}

export function generateSessionHash(): string {
  return createHash("sha256")
    .update(Date.now().toString() + Math.random().toString())
    .digest("hex")
    .slice(0, 16);
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
