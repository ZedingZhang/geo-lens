import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getEnv } from "@/lib/env";
import {
  getOrCreateDemoSessionFromRequest,
  getDemoCookieOptions,
} from "./session";

function setSessionCookieIfNeeded(
  response: NextResponse,
  sessionHash: string,
  shouldSetCookie: boolean
) {
  if (shouldSetCookie) {
    const opts = getDemoCookieOptions(sessionHash);
    response.cookies.set(opts.name, opts.value, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      maxAge: opts.maxAge,
      path: opts.path,
    });
  }
}

export async function getSessionContext(
  request: NextRequest
): Promise<{
  sessionHash: string | null;
  isDemo: boolean;
  cookieToSet: { hash: string } | null;
}> {
  const isDemo = getEnv().DEMO_MODE;

  if (!isDemo) {
    return { sessionHash: null, isDemo: false, cookieToSet: null };
  }

  const { sessionHash, shouldSetCookie } =
    await getOrCreateDemoSessionFromRequest(request);

  return {
    sessionHash,
    isDemo: true,
    cookieToSet: shouldSetCookie ? { hash: sessionHash } : null,
  };
}

export async function assertProjectAccess(
  request: NextRequest,
  projectId: string
): Promise<
  | { allowed: true; project: Record<string, unknown>; response?: NextResponse }
  | { allowed: false; response: NextResponse }
> {
  const isDemo = getEnv().DEMO_MODE;
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return {
      allowed: false,
      response: NextResponse.json({ error: "Project not found" }, { status: 404 }),
    };
  }

  if (!isDemo) {
    return { allowed: true, project: project as unknown as Record<string, unknown> };
  }

  // Sample projects are readable by anyone
  if (project.isSample) {
    return { allowed: true, project: project as unknown as Record<string, unknown> };
  }

  const { sessionHash, shouldSetCookie } =
    await getOrCreateDemoSessionFromRequest(request);

  if (project.demoSessionHash !== sessionHash) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      ),
    };
  }

  const res = NextResponse.json({ project });
  setSessionCookieIfNeeded(res, sessionHash, shouldSetCookie);

  return { allowed: true, project: project as unknown as Record<string, unknown> };
}

export async function assertProjectWriteAccess(
  request: NextRequest,
  projectId: string
): Promise<
  | { allowed: true; project: Record<string, unknown>; response?: NextResponse }
  | { allowed: false; response: NextResponse }
> {
  const isDemo = getEnv().DEMO_MODE;
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return {
      allowed: false,
      response: NextResponse.json({ error: "Project not found" }, { status: 404 }),
    };
  }

  if (!isDemo) {
    return { allowed: true, project: project as unknown as Record<string, unknown> };
  }

  // Sample projects are read-only in demo mode
  if (project.isSample) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Sample projects are read-only. Create your own project to run analysis." },
        { status: 403 }
      ),
    };
  }

  const { sessionHash, shouldSetCookie } =
    await getOrCreateDemoSessionFromRequest(request);

  if (project.demoSessionHash !== sessionHash) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      ),
    };
  }

  setSessionCookieIfNeeded(
    new NextResponse(),
    sessionHash,
    shouldSetCookie
  );

  return { allowed: true, project: project as unknown as Record<string, unknown> };
}
