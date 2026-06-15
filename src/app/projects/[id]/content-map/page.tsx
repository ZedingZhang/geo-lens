"use client";

import { use, useEffect, useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  FileSearch,
  GitCompare,
  HelpCircle,
  Home,
  Info,
  Loader2,
  RefreshCw,
  Table,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ContentMapStatus,
  ContentPageType,
  MissingContentMapResult,
} from "@/lib/geo/missing-content-map";

type ProjectSummary = {
  brandName: string;
  audience: string;
};

const pageIcon: Record<ContentPageType, ElementType> = {
  homepage: Home,
  about: UserRound,
  comparison: GitCompare,
  faq: HelpCircle,
  docs_blog: BookOpen,
  technical: FileSearch,
};

const statusStyle: Record<ContentMapStatus, string> = {
  ok: "badge-success",
  weak: "badge-warning",
  missing: "badge-error",
};

export default function ContentMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [contentMap, setContentMap] = useState<MissingContentMapResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then((response) => response.json()),
      fetch(`/api/projects/${id}/content-map`, { method: "POST" }).then((response) =>
        response.json()
      ),
    ])
      .then(([projectData, mapData]) => {
        if (projectData.error) throw new Error(projectData.error);
        if (mapData.error) throw new Error(mapData.error);
        setProject(projectData.project);
        setContentMap(mapData);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load content map")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const regenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${id}/content-map`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate map");
      setContentMap(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate map");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">Missing Content Map</h1>
            <span className="badge badge-info text-[10px]">strategy</span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            {project?.brandName || "Brand"} content gaps by page type and GEO need
          </p>
        </div>
        <button
          onClick={regenerate}
          disabled={generating}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 shrink-0"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh Map
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!contentMap ? (
        <div className="card p-12 text-center">
          <Table className="h-10 w-10 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            No content map available.
          </p>
          <button
            onClick={regenerate}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium"
          >
            Generate Content Map
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <SummaryCard label="Needs" value={contentMap.summary.totalNeeds} />
            <SummaryCard label="Missing" value={contentMap.summary.missing} tone="error" />
            <SummaryCard label="Weak" value={contentMap.summary.weak} tone="warning" />
            <SummaryCard label="OK" value={contentMap.summary.ok} tone="success" />
            <div className="card p-4">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">
                First Page
              </div>
              <div className="text-sm font-semibold">
                {contentMap.summary.highestPriorityPage}
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3 mb-6">
            {contentMap.pageGaps.map((gap) => {
              const Icon = pageIcon[gap.pageType];
              const empty = gap.gaps.length === 0;
              return (
                <div key={gap.pageType} className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
                    <h2 className="font-semibold text-sm">{gap.label}</h2>
                    {empty ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500 ml-auto" />
                    )}
                  </div>
                  {empty ? (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      No immediate content gap detected.
                    </p>
                  ) : (
                    <ul className="space-y-1.5 mb-3">
                      {gap.gaps.map((item) => (
                        <li key={item} className="text-xs flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!empty && (
                    <div className="flex flex-wrap gap-1">
                      {gap.suggestedPages.map((page) => (
                        <span key={page} className="badge badge-info text-[10px]">
                          <Info className="mr-1 h-3 w-3" />
                          {page}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
              <Table className="h-4 w-4 text-[var(--muted-foreground)]" />
              <h2 className="font-semibold text-sm">Content Strategy Matrix</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      GEO need
                    </th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Existing page
                    </th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Suggested page
                    </th>
                    <th className="text-left font-medium px-4 py-3 min-w-[280px]">
                      Rationale
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contentMap.rows.map((row) => (
                    <tr key={`${row.geoNeed}-${row.suggestedPage}`} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-4 py-3 font-medium">{row.geoNeed}</td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)]">
                        {row.existingPage}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("badge text-[10px]", statusStyle[row.status])}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{row.suggestedPage}</td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)]">
                        {row.rationale}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "warning" | "error";
}) {
  const toneClass =
    tone === "success"
      ? "text-green-600"
      : tone === "warning"
        ? "text-amber-600"
        : tone === "error"
          ? "text-red-600"
          : "";

  return (
    <div className="card p-4">
      <div className="text-xs text-[var(--muted-foreground)] mb-1">{label}</div>
      <div className={cn("text-2xl font-bold", toneClass)}>{value}</div>
    </div>
  );
}
