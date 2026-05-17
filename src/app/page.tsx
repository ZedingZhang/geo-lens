import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import {
  PlusCircle,
  Sparkles,
  FolderOpen,
  ArrowRight,
} from "lucide-react";

export default async function HomePage() {
  let projects: Array<{
    id: string;
    name: string;
    brandName: string;
    updatedAt: Date;
    isSample: boolean;
    analyses: Array<{ totalScore: number }>;
  }> = [];

  try {
    projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        analyses: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  } catch {
    // Database may not be available
  }

  let avgScore = "—";
  if (projects.length > 0) {
    const scores = projects
      .map((p) => p.analyses[0]?.totalScore)
      .filter(Boolean) as number[];
    if (scores.length > 0) {
      avgScore = String(Math.round(scores.reduce((s, v) => s + v, 0) / scores.length));
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GEO Lens</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Generative Engine Optimization Platform
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="h-4 w-4" />
          New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{projects.length}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Projects</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{avgScore}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Avg GEO Score</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-[var(--muted-foreground)]">Quick Actions</div>
              <div className="text-sm font-medium mt-1">
                <Link href="/strategies" className="text-[var(--primary)] hover:underline">
                  View Strategy Library →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Recent Projects</h2>
        {projects.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-[var(--muted-foreground)] mb-4">
              No projects yet. Create your first GEO analysis project.
            </div>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium"
            >
              <PlusCircle className="h-4 w-4" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="card p-4 flex items-center justify-between hover:border-[var(--primary)] transition-colors group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{project.name}</h3>
                    {project.isSample && (
                      <span className="badge badge-info text-[10px]">Sample</span>
                    )}
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)] mt-0.5">
                    {project.brandName} · Updated {formatDate(project.updatedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {project.analyses[0] && (
                    <div className="text-right">
                      <div
                        className="text-xl font-bold"
                        style={{
                          color:
                            project.analyses[0].totalScore >= 80
                              ? "#22c55e"
                              : project.analyses[0].totalScore >= 60
                              ? "#eab308"
                              : "#ef4444",
                        }}
                      >
                        {project.analyses[0].totalScore}
                      </div>
                      <div className="text-[10px] text-[var(--muted-foreground)]">GEO Score</div>
                    </div>
                  )}
                  <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
