"use client";

import { use, useEffect, useState } from "react";
import {
  BadgeCheck,
  Bot,
  CheckCircle2,
  CircleDashed,
  Loader2,
  MessageSquareQuote,
  SearchCheck,
  Sparkles,
  ThumbsUp,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModelVisibilityDemo, ModelVisibilityStatus } from "@/lib/geo/model-visibility";

type ProjectSummary = {
  id: string;
  brandName: string;
  audience: string;
  product: string;
};

const statusTone: Record<ModelVisibilityStatus, string> = {
  strong: "badge-success",
  partial: "badge-warning",
  missing: "badge-error",
};

function BooleanBadge({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {
  return (
    <span className={cn("badge text-[10px]", active ? "badge-success" : "badge-error")}>
      {active ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
      {label}
    </span>
  );
}

export default function ModelsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [result, setResult] = useState<ModelVisibilityDemo | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProject(data.project);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load project"))
      .finally(() => setLoading(false));
  }, [id]);

  const runDemo = async () => {
    setGenerating(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${id}/models`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Model visibility demo failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Model visibility demo failed");
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
            <h1 className="text-2xl font-bold">Model Visibility</h1>
            <span className="badge badge-info text-[10px]">demo</span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            {project?.brandName || "Brand"} across ChatGPT, Perplexity, Gemini, Claude, and AI Overviews
          </p>
        </div>
        <button
          onClick={runDemo}
          disabled={generating}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 shrink-0"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {result ? "Re-run Demo" : "Run Demo Scan"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!result ? (
        <div className="card p-12 text-center">
          <Bot className="h-10 w-10 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <h3 className="font-semibold mb-2">No model scan yet</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Demo scan for whether major AI answer engines know, recommend, or cite the brand.
          </p>
          <button
            onClick={runDemo}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />}
            Run Demo Scan
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <div className="card p-4">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Avg Score</div>
              <div className="text-2xl font-bold">{result.summary.averageScore}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Known</div>
              <div className="text-2xl font-bold">{result.summary.knownBy}/{result.summary.modelsChecked}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Recommended</div>
              <div className="text-2xl font-bold">{result.summary.recommendedBy}/{result.summary.modelsChecked}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Cited</div>
              <div className="text-2xl font-bold">{result.summary.citedBy}/{result.summary.modelsChecked}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Source</div>
              <div className="text-sm font-semibold uppercase">{result.resultSource}</div>
            </div>
          </div>

          <div className="card p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquareQuote className="h-4 w-4 text-[var(--muted-foreground)]" />
              <h2 className="font-semibold text-sm">Demo Query Set</h2>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              {result.querySet.map((query) => (
                <div key={query} className="text-sm bg-[var(--muted)] rounded-md p-3">
                  {query}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {result.models.map((model) => (
              <div key={model.id} className="card p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
                      <h3 className="font-semibold text-sm">{model.model}</h3>
                      <span className="text-xs text-[var(--muted-foreground)]">{model.provider}</span>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">{model.queryFocus}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("badge text-[10px]", statusTone[model.citationStatus])}>
                      {model.citationStatus}
                    </span>
                    <span className="text-lg font-bold">{model.visibilityScore}</span>
                  </div>
                </div>

                <div className="flex gap-1.5 flex-wrap mb-3">
                  <BooleanBadge active={model.knowsBrand} label="Knows" />
                  <BooleanBadge active={model.recommendsBrand} label="Recommends" />
                  <BooleanBadge active={model.citesBrand} label="Cites" />
                </div>

                <p className="text-sm mb-3">{model.answerPreview}</p>

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="bg-[var(--muted)] rounded-md p-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium mb-2">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Evidence
                    </div>
                    <ul className="space-y-1">
                      {model.evidence.map((item) => (
                        <li key={item} className="text-xs text-[var(--muted-foreground)]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[var(--muted)] rounded-md p-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium mb-2">
                      <CircleDashed className="h-3.5 w-3.5" />
                      Citation Preview
                    </div>
                    {model.citationPreview.length > 0 ? (
                      <ul className="space-y-1">
                        {model.citationPreview.map((item) => (
                          <li key={item} className="text-xs text-[var(--muted-foreground)]">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-[var(--muted-foreground)]">No citation target in this demo answer.</p>
                    )}
                  </div>
                  <div className="bg-[var(--muted)] rounded-md p-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium mb-2">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      Next Step
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">{model.nextStep}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
