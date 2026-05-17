"use client";

import { useEffect, useState, use } from "react";
import { Loader2, Sparkles, ShieldCheck, Check, X, AlertTriangle } from "lucide-react";
import { parseJsonField } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusIcon = { pass: Check, warning: AlertTriangle, fail: X };
const statusStyle = { pass: "text-green-500 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800", warning: "text-amber-500 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800", fail: "text-red-500 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" };

export default function ReadinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [audit, setAudit] = useState<{
    id: string; totalScore: number; checks: string; summary: string; resultSource: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(d => {
        const audits = d.project?.readinessAudits || [];
        setAudit(audits[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${id}/readiness`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setAudit(d.audit);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setGenerating(false); }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">AI Readiness Technical Audit</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Check if your site is optimized for AI crawlers and answer engines</p>
        </div>
        <button onClick={generate} disabled={generating} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {audit ? "Re-run Audit" : "Run Audit"}
        </button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">{error}</div>}

      {!audit ? (
        <div className="card p-12 text-center">
          <ShieldCheck className="h-10 w-10 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)] mb-4">No audit data yet.</p>
          <button onClick={generate} className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">Run Technical Audit</button>
        </div>
      ) : (
        <div>
          <div className="card p-4 mb-4 text-center">
            <div className="text-sm text-[var(--muted-foreground)] mb-1">AI Readiness Score</div>
            <div className={cn("text-4xl font-bold", audit.totalScore >= 80 ? "text-green-500" : audit.totalScore >= 60 ? "text-amber-500" : "text-red-500")}>{audit.totalScore}</div>
            <div className="text-xs text-[var(--muted-foreground)]">out of 100 · {audit.resultSource}</div>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">{audit.summary}</p>
          <div className="space-y-3">
            {parseJsonField<Array<{ key: string; label: string; status: "pass" | "warning" | "fail"; impact: string; fix: string; relatedStrategies: string[] }>>(audit.checks, []).map((c, i) => {
              const Icon = statusIcon[c.status];
              return (
                <div key={i} className={cn("card p-3 border", statusStyle[c.status])}>
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{c.label}</span>
                        <span className={cn("badge text-[10px]", c.status === "pass" ? "badge-success" : c.status === "warning" ? "badge-warning" : "badge-error")}>{c.status}</span>
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] mb-1">{c.impact}</div>
                      <div className="text-xs"><span className="font-medium">Fix: </span>{c.fix}</div>
                      {c.relatedStrategies.length > 0 && (
                        <div className="flex gap-1 mt-1.5">
                          {c.relatedStrategies.map(s => <span key={s} className="badge badge-info text-[10px]">{s}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
