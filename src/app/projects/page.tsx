import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PlusCircle, ArrowRight } from "lucide-react";

export default async function ProjectsPage() {
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
      include: {
        analyses: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  } catch {}

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90"
        >
          <PlusCircle className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-[var(--muted-foreground)] mb-4">
            No projects yet.
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium"
          >
            <PlusCircle className="h-4 w-4" />
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="card p-4 flex items-center justify-between hover:border-[var(--primary)] transition-colors group"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{p.name}</h3>
                  {p.isSample && (
                    <span className="badge badge-info text-[10px]">Sample</span>
                  )}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  {p.brandName} · Updated {formatDate(p.updatedAt)}
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {p.analyses[0] && (
                  <div
                    className="text-xl font-bold"
                    style={{
                      color:
                        p.analyses[0].totalScore >= 80
                          ? "#22c55e"
                          : p.analyses[0].totalScore >= 60
                          ? "#eab308"
                          : "#ef4444",
                    }}
                  >
                    {p.analyses[0].totalScore}
                  </div>
                )}
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
