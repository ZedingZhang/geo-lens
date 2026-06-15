"use client";

import { useEffect, useState, use } from "react";
import {
  Archive,
  CheckCircle,
  Download,
  FlaskConical,
  Loader2,
  Pencil,
  Play,
  PlusCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { parseJsonField } from "@/lib/utils";
import { getStatusColor, getStatusLabel, getDeltaLabel, getDeltaColor } from "@/lib/geo/experiments";
import {
  buildExperimentMetricRows,
  formatExperimentDelta,
  formatExperimentMetricValue,
  parseExperimentNotes,
} from "@/lib/geo/experiment-loop";

export default function ExperimentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [experiments, setExperiments] = useState<Array<{
    id: string; name: string; strategyId: string | null; status: string;
    baselineScore: number | null; afterScore: number | null; delta: number | null;
    impactedDimensions: string[]; notes: string | null; createdAt: string; completedAt: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", strategyId: "", baselineScore: "", notes: "", impactedDimensions: "" });
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const fetchExps = async () => {
    const r = await fetch(`/api/projects/${id}/experiments`);
    const d = await r.json();
    setExperiments((d.experiments || []).map((e: Record<string, unknown>) => ({
      ...e,
      impactedDimensions: typeof e.impactedDimensions === 'string' ? parseJsonField(e.impactedDimensions, []) : (e.impactedDimensions || [])
    })));
    setLoading(false);
  };

  useEffect(() => { fetchExps(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  const create = async () => {
    if (!formData.name.trim()) return;
    try {
      const res = await fetch(`/api/projects/${id}/experiments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          strategyId: formData.strategyId || undefined,
          baselineScore: formData.baselineScore ? parseInt(formData.baselineScore) : undefined,
          impactedDimensions: formData.impactedDimensions ? formData.impactedDimensions.split(",").map(s => s.trim()).filter(Boolean) : [],
          notes: formData.notes || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setShowForm(false);
      setFormData({ name: "", strategyId: "", baselineScore: "", notes: "", impactedDimensions: "" });
      fetchExps();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  };

  const updateStatus = async (experimentId: string, status: string) => {
    try {
      await fetch(`/api/projects/${id}/experiments/${experimentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchExps();
    } catch { setError("Failed to update"); }
  };

  const runLoopAction = async (
    experimentId: string,
    action: "baseline" | "apply" | "rerun"
  ) => {
    setBusyAction(`${experimentId}:${action}`);
    try {
      const res = await fetch(`/api/projects/${id}/experiments/${experimentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to update experiment");
      fetchExps();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update experiment");
    } finally {
      setBusyAction(null);
    }
  };

  const exportReport = async (experimentId: string, experimentName: string) => {
    setBusyAction(`${experimentId}:export`);
    try {
      const res = await fetch(`/api/projects/${id}/experiments/${experimentId}/report`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to export report");
      const blob = new Blob([data.markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${experimentName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "experiment"}-report.md`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to export report");
    } finally {
      setBusyAction(null);
    }
  };

  const remove = async (experimentId: string) => {
    try {
      await fetch(`/api/projects/${id}/experiments/${experimentId}`, { method: "DELETE" });
      fetchExps();
    } catch { setError("Failed to delete"); }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Before / After Experiment Loop</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Run baseline, apply content changes, re-run audit, compare score deltas, and export the experiment report</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90">
          <PlusCircle className="h-4 w-4" />New Experiment
        </button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
        {[
          ["1", "Run baseline audit"],
          ["2", "Apply content changes"],
          ["3", "Re-run audit"],
          ["4", "Compare score delta"],
          ["5", "Export report"],
        ].map(([step, label]) => (
          <div key={step} className="card p-3 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-[var(--primary)] text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {step}
            </span>
            <span className="text-xs font-medium">{label}</span>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--card)]" placeholder="Experiment name" />
            <input value={formData.strategyId} onChange={e => setFormData({ ...formData, strategyId: e.target.value })} className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--card)]" placeholder="Strategy ID (optional)" />
            <input value={formData.baselineScore} onChange={e => setFormData({ ...formData, baselineScore: e.target.value })} type="number" className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--card)]" placeholder="Baseline GEO Score" />
            <input value={formData.impactedDimensions} onChange={e => setFormData({ ...formData, impactedDimensions: e.target.value })} className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--card)]" placeholder="Dimensions (comma separated)" />
          </div>
          <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--card)] mb-3" placeholder="Notes" />
          <div className="flex gap-2">
            <button onClick={create} className="px-4 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm">Create</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 border border-[var(--border)] rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {experiments.length === 0 ? (
        <div className="card p-12 text-center">
          <FlaskConical className="h-10 w-10 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">No experiments yet. Start tracking GEO optimizations.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {experiments.map((e) => {
            const envelope = parseExperimentNotes(e.notes);
            const metricRows = buildExperimentMetricRows(envelope.experimentLoop);
            const hasBaseline = Boolean(envelope.experimentLoop.baseline);
            const hasAfter = Boolean(envelope.experimentLoop.after);

            return (
            <div key={e.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate">{e.name}</h3>
                    <span className="badge text-[10px]" style={{ background: `${getStatusColor(e.status)}20`, color: getStatusColor(e.status) }}>{getStatusLabel(e.status)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div><span className="text-[var(--muted-foreground)]">Baseline: </span><span className="font-medium">{e.baselineScore ?? "—"}</span></div>
                    <div><span className="text-[var(--muted-foreground)]">After: </span><span className="font-medium">{e.afterScore ?? "—"}</span></div>
                    <div>
                      <span className="text-[var(--muted-foreground)]">Delta: </span>
                      <span className="font-bold" style={{ color: getDeltaColor(e.delta) }}>{getDeltaLabel(e.delta)}</span>
                    </div>
                  </div>
                  {envelope.userNotes && <div className="text-xs text-[var(--muted-foreground)] mt-1">{envelope.userNotes}</div>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {e.status === "planned" && <button onClick={() => updateStatus(e.id, "running")} className="p-1 hover:bg-blue-50 dark:hover:bg-blue-950 rounded" title="Start"><Play className="h-3.5 w-3.5 text-blue-500" /></button>}
                  {e.status === "running" && <button onClick={() => updateStatus(e.id, "completed")} className="p-1 hover:bg-green-50 dark:hover:bg-green-950 rounded" title="Complete"><CheckCircle className="h-3.5 w-3.5 text-green-500" /></button>}
                  {(e.status === "completed" || e.status === "running") && <button onClick={() => updateStatus(e.id, "archived")} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Archive"><Archive className="h-3.5 w-3.5" /></button>}
                  <button onClick={() => remove(e.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-950 rounded" title="Delete"><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => runLoopAction(e.id, "baseline")}
                  disabled={busyAction === `${e.id}:baseline`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border)] rounded-md text-xs hover:bg-[var(--muted)] disabled:opacity-50"
                >
                  {busyAction === `${e.id}:baseline` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  Run baseline
                </button>
                <button
                  onClick={() => runLoopAction(e.id, "apply")}
                  disabled={!hasBaseline || busyAction === `${e.id}:apply`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border)] rounded-md text-xs hover:bg-[var(--muted)] disabled:opacity-50"
                >
                  {busyAction === `${e.id}:apply` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
                  Apply changes
                </button>
                <button
                  onClick={() => runLoopAction(e.id, "rerun")}
                  disabled={!hasBaseline || busyAction === `${e.id}:rerun`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border)] rounded-md text-xs hover:bg-[var(--muted)] disabled:opacity-50"
                >
                  {busyAction === `${e.id}:rerun` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Re-run audit
                </button>
                <button
                  onClick={() => exportReport(e.id, e.name)}
                  disabled={!hasAfter || busyAction === `${e.id}:export`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] text-white rounded-md text-xs hover:opacity-90 disabled:opacity-50"
                >
                  {busyAction === `${e.id}:export` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  Export report
                </button>
              </div>

              {hasBaseline && (
                <div className="mt-4 overflow-x-auto border border-[var(--border)] rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                        <th className="text-left font-medium px-3 py-2">Metric</th>
                        <th className="text-right font-medium px-3 py-2">Before</th>
                        <th className="text-right font-medium px-3 py-2">After</th>
                        <th className="text-right font-medium px-3 py-2">Delta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metricRows.map((row) => (
                        <tr key={row.metric} className="border-b border-[var(--border)] last:border-0">
                          <td className="px-3 py-2">{row.metric}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{formatExperimentMetricValue(row.before, row.format)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{formatExperimentMetricValue(row.after, row.format)}</td>
                          <td className="px-3 py-2 text-right tabular-nums font-semibold" style={{ color: row.delta === null ? undefined : row.delta >= 0 ? "#16a34a" : "#dc2626" }}>{formatExperimentDelta(row.delta, row.format)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {envelope.experimentLoop.appliedChanges.length > 0 && (
                <div className="mt-3 text-xs text-[var(--muted-foreground)]">
                  <span className="font-medium text-[var(--foreground)]">Applied: </span>
                  {envelope.experimentLoop.appliedChanges.join("; ")}
                </div>
              )}
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
