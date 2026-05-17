"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  MessageSquareText,
  FileText,
  Stethoscope,
  GitCompare,
  ShieldCheck,
  Lightbulb,
  Map,
  FlaskConical,
  FileDown,
  ArrowRight,
} from "lucide-react";
import { parseJsonField } from "@/lib/utils";
import { GEO_DIMENSIONS, scoreToColor } from "@/lib/geo/scoring";
import { ScoreChart } from "@/components/analysis/score-chart";

type ProjectData = {
  project: {
    id: string;
    name: string;
    brandName: string;
    websiteUrl: string | null;
    description: string;
    audience: string;
    product: string;
    keywords: string[];
    competitors: string[];
    analyses: Array<{
      id: string;
      totalScore: number;
      entityClarity: number;
      answerCoverage: number;
      citationReadiness: number;
      contentStructure: number;
      freshnessSignal: number;
      strengths: string;
      weaknesses: string;
      nextActions: string;
      resultSource: string;
    }>;
    questions: Array<{ id: string }>;
    recommendations: Array<{ id: string }>;
    diagnoses: Array<{ id: string }>;
    contentDiffs: Array<{ id: string }>;
    readinessAudits: Array<{ id: string }>;
    promptItems: Array<{ id: string }>;
    sourceMaps: Array<{ id: string }>;
    experiments: Array<{ id: string }>;
  };
};

const subModules = [
  { href: "questions", label: "AI Questions", icon: MessageSquareText, count: "questions" as const },
  { href: "recommendations", label: "Recommendations", icon: FileText, count: "recommendations" as const },
  { href: "diagnostics", label: "Citation Diagnostics", icon: Stethoscope, count: "diagnoses" as const },
  { href: "diff", label: "Before/After Diff", icon: GitCompare, count: "contentDiffs" as const },
  { href: "readiness", label: "Technical Audit", icon: ShieldCheck, count: "readinessAudits" as const },
  { href: "prompts", label: "Prompt Portfolio", icon: Lightbulb, count: "promptItems" as const },
  { href: "sources", label: "Source Map", icon: Map, count: "sourceMaps" as const },
  { href: "experiments", label: "Experiments", icon: FlaskConical, count: "experiments" as const },
];

export default function ProjectDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const runAnalysis = async () => {
    setAnalyzeLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}/analyze`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Analysis failed");

      // Refresh project data
      const projRes = await fetch(`/api/projects/${id}`);
      const projData = await projRes.json();
      setData(projData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="card p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push("/projects")}
            className="text-[var(--primary)] hover:underline text-sm"
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { project } = data;
  const analysis = project.analyses[0];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {project.brandName} · {project.audience}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/projects/${id}/report`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--muted)]"
          >
            <FileDown className="h-4 w-4" />
            Report
          </Link>
          <button
            onClick={runAnalysis}
            disabled={analyzeLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {analyzeLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {analysis ? "Re-run Analysis" : "Run GEO Analysis"}
          </button>
        </div>
      </div>

      {/* GEO Score */}
      {analysis ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 flex flex-col items-center justify-center">
              <div className="text-sm text-[var(--muted-foreground)] mb-2">
                GEO Score
              </div>
              <div
                className="text-5xl font-bold"
                style={{ color: scoreToColor(analysis.totalScore) }}
              >
                {analysis.totalScore}
              </div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">
                out of 100 · Source: {analysis.resultSource}
              </div>
            </div>
            <div className="card p-4 lg:col-span-2">
              <ScoreChart
                scores={{
                  entityClarity: analysis.entityClarity,
                  answerCoverage: analysis.answerCoverage,
                  citationReadiness: analysis.citationReadiness,
                  contentStructure: analysis.contentStructure,
                  freshnessSignal: analysis.freshnessSignal,
                }}
              />
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card p-4">
              <h3 className="font-semibold text-sm mb-3 text-green-600 dark:text-green-400">
                Strengths
              </h3>
              <ul className="space-y-1.5">
                {parseJsonField<string[]>(analysis.strengths, []).map((s, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-4">
              <h3 className="font-semibold text-sm mb-3 text-red-600 dark:text-red-400">
                Weaknesses
              </h3>
              <ul className="space-y-1.5">
                {parseJsonField<string[]>(analysis.weaknesses, []).map((w, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-red-500 mt-0.5 shrink-0">✗</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Actions */}
          <div className="card p-4 mb-8">
            <h3 className="font-semibold text-sm mb-3">Priority Actions</h3>
            <ol className="space-y-1.5">
              {parseJsonField<string[]>(analysis.nextActions, []).map((a, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-[var(--primary)] font-medium shrink-0">
                    {i + 1}.
                  </span>
                  {a}
                </li>
              ))}
            </ol>
          </div>
        </>
      ) : (
        <div className="card p-12 text-center mb-8">
          <Sparkles className="h-10 w-10 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <h3 className="font-semibold mb-2">No Analysis Yet</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Run a GEO analysis to get scores, strengths, weaknesses, and
            optimization recommendations.
          </p>
          <button
            onClick={runAnalysis}
            disabled={analyzeLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium"
          >
            {analyzeLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Run GEO Analysis
          </button>
        </div>
      )}

      {/* Sub-module grid */}
      <h2 className="text-lg font-semibold mb-3">Analysis Modules</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {subModules.map((mod) => {
          const Icon = mod.icon;
          const count = project[mod.count]?.length ?? 0;
          return (
            <Link
              key={mod.href}
              href={`/projects/${id}/${mod.href}`}
              className="card p-4 flex items-center justify-between hover:border-[var(--primary)] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-[var(--muted-foreground)]" />
                <div>
                  <div className="text-sm font-medium">{mod.label}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {count > 0 ? `${count} item${count !== 1 ? "s" : ""}` : "Not run yet"}
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
