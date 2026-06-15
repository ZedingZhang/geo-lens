"use client";

import { use, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Fingerprint,
  Info,
  ListChecks,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  BrandAmbiguityChecklistItem,
  BrandAmbiguityResult,
  BrandAmbiguityRisk,
  BrandAmbiguitySeverity,
} from "@/lib/geo/brand-ambiguity";

type ProjectSummary = {
  brandName: string;
  audience: string;
};

const riskTone: Record<BrandAmbiguityRisk, string> = {
  High: "badge-error",
  Medium: "badge-warning",
  Low: "badge-success",
};

const severityTone: Record<BrandAmbiguitySeverity, string> = {
  high: "badge-error",
  medium: "badge-warning",
  low: "badge-info",
};

const checklistTone: Record<BrandAmbiguityChecklistItem["status"], string> = {
  ok: "badge-success",
  weak: "badge-warning",
  missing: "badge-error",
};

export default function BrandAmbiguityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [result, setResult] = useState<BrandAmbiguityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then((response) => response.json()),
      fetch(`/api/projects/${id}/ambiguity`, { method: "POST" }).then((response) =>
        response.json()
      ),
    ])
      .then(([projectData, ambiguityData]) => {
        if (projectData.error) throw new Error(projectData.error);
        if (ambiguityData.error) throw new Error(ambiguityData.error);
        setProject(projectData.project);
        setResult(ambiguityData);
      })
      .catch((e) =>
        setError(
          e instanceof Error ? e.message : "Failed to load ambiguity detection"
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  const regenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${id}/ambiguity`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to detect ambiguity");
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to detect ambiguity");
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">Brand Ambiguity</h1>
            <span className="badge badge-info text-[10px]">rules</span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            {project?.brandName || "Brand"} naming collision and entity
            disambiguation risk
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
          Refresh Detection
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!result ? (
        <div className="card p-12 text-center">
          <Fingerprint className="h-10 w-10 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <h3 className="font-semibold mb-2">No ambiguity result available</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Run the rule-based detector to check whether this brand name could
            collide with other entities.
          </p>
          <button
            onClick={regenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSearch className="h-4 w-4" />
            )}
            Run Detection
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <SummaryCard label="Ambiguity Risk">
              <span className={cn("badge text-[11px]", riskTone[result.ambiguityRisk])}>
                {result.ambiguityRisk}
              </span>
            </SummaryCard>
            <SummaryCard label="Risk Score">
              <span className="text-2xl font-bold">{result.riskScore}</span>
            </SummaryCard>
            <SummaryCard label="Possible Meanings">
              <span className="text-2xl font-bold">
                {result.possibleAmbiguities.length}
              </span>
            </SummaryCard>
            <SummaryCard label="Signals">
              <span className="text-2xl font-bold">{result.signals.length}</span>
            </SummaryCard>
          </div>

          <div className="card p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="font-semibold text-sm">Primary Output</h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <div className="text-xs font-medium text-[var(--muted-foreground)] mb-2">
                  Possible ambiguity
                </div>
                <ul className="space-y-2">
                  {result.possibleAmbiguities.map((item) => (
                    <li key={item} className="text-sm flex items-start gap-2">
                      <Info className="h-4 w-4 text-[var(--muted-foreground)] mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <OutputBlock label="Ambiguity risk">
                  <span className={cn("badge text-[11px]", riskTone[result.ambiguityRisk])}>
                    {result.ambiguityRisk}
                  </span>
                </OutputBlock>
                <OutputBlock label="Reason">{result.reason}</OutputBlock>
                <OutputBlock label="Recommendation">
                  {result.recommendation}
                </OutputBlock>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3 mb-6">
            {result.signals.map((signal) => (
              <div key={`${signal.type}-${signal.label}`} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Fingerprint className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <h3 className="font-semibold text-sm">{signal.label}</h3>
                  <span className={cn("badge text-[10px] ml-auto", severityTone[signal.severity])}>
                    {signal.severity}
                  </span>
                </div>
                <div className="text-xs text-[var(--muted-foreground)] uppercase mb-2">
                  {signal.type.replace(/_/g, " ")}
                </div>
                <p className="text-sm">{signal.evidence}</p>
              </div>
            ))}
          </div>

          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-[var(--muted-foreground)]" />
              <h2 className="font-semibold text-sm">Disambiguation Checklist</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Field
                    </th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left font-medium px-4 py-3 min-w-[360px]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.checklist.map((item) => (
                    <tr
                      key={item.field}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">{item.field}</td>
                      <td className="px-4 py-3">
                        <span className={cn("badge text-[10px]", checklistTone[item.status])}>
                          {item.status === "ok" ? (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)]">
                        {item.action}
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
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-4">
      <div className="text-xs text-[var(--muted-foreground)] mb-1">{label}</div>
      <div className="min-h-8 flex items-center">{children}</div>
    </div>
  );
}

function OutputBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-[var(--muted-foreground)] mb-1">
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
