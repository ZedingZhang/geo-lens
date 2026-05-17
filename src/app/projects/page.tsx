"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { PlusCircle, ArrowRight, Loader2 } from "lucide-react";
import { scoreToColor } from "@/lib/geo/scoring";

interface ProjectItem {
  id: string;
  name: string;
  brandName: string;
  updatedAt: string;
  isSample: boolean;
  analyses: Array<{ totalScore: number }>;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {loading ? "Loading..." : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
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

      {loading ? (
        <div className="card p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-[var(--muted-foreground)] mb-4">No projects yet.</div>
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
                    style={{ color: scoreToColor(p.analyses[0].totalScore) }}
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
