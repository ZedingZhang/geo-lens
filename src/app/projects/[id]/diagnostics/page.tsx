"use client";

import { useEffect, useState, use } from "react";
import { Loader2, Sparkles, Stethoscope, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const severityIcon = { high: AlertCircle, medium: AlertTriangle, low: Info };
const severityColor = { high: "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950", medium: "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950", low: "border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950" };

export default function DiagnosticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [diagnoses, setDiagnoses] = useState<Array<{
    id: string; failureType: string; severity: "high" | "medium" | "low";
    evidence: string; reason: string; fix: string; impactedDimension: string; resultSource: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(d => { setDiagnoses(d.project?.diagnoses || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${id}/diagnostics`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setDiagnoses(d.diagnoses);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setGenerating(false); }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const sorted = [...diagnoses].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Citation Failure Diagnosis</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Diagnose why your brand fails to be cited by AI answer engines</p>
        </div>
        <button onClick={generate} disabled={generating} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {diagnoses.length ? "Re-diagnose" : "Run Diagnosis"}
        </button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {sorted.length === 0 ? (
        <div className="card p-12 text-center">
          <Stethoscope className="h-10 w-10 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)] mb-4">No diagnosis yet. Run GEO analysis first, then diagnose citation failures.</p>
          <button onClick={generate} className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">Run Diagnosis</button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((d) => {
            const Icon = severityIcon[d.severity];
            return (
              <div key={d.id} className={cn("card p-4 border", severityColor[d.severity])}>
                <div className="flex items-start gap-3">
                  <Icon className={cn("h-5 w-5 shrink-0 mt-0.5",
                    d.severity === "high" ? "text-red-500" : d.severity === "medium" ? "text-amber-500" : "text-blue-500"
                  )} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm capitalize">{d.failureType.replace(/_/g, " ")}</h3>
                      <span className={cn("badge text-[10px]", d.severity === "high" ? "badge-error" : d.severity === "medium" ? "badge-warning" : "badge-info")}>{d.severity}</span>
                      <span className="badge badge-info text-[10px]">{d.impactedDimension}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium text-xs text-[var(--muted-foreground)]">Evidence: </span>{d.evidence}</div>
                      <div><span className="font-medium text-xs text-[var(--muted-foreground)]">Reason: </span>{d.reason}</div>
                      <div className="pt-1 border-t border-current/10">
                        <span className="font-medium text-xs text-green-600 dark:text-green-400">Fix: </span>{d.fix}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
