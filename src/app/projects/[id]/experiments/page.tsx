"use client";

import { useEffect, useState, use } from "react";
import { Loader2, PlusCircle, FlaskConical, Trash2, Play, CheckCircle, Archive } from "lucide-react";
import { parseJsonField, cn, formatDate } from "@/lib/utils";
import { getStatusColor, getStatusLabel, getDeltaLabel, getDeltaColor } from "@/lib/geo/experiments";

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
          <h1 className="text-2xl font-bold">GEO Experiment Tracker</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Track optimization experiments and their impact on GEO scores</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90">
          <PlusCircle className="h-4 w-4" />New Experiment
        </button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">{error}</div>}

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
          {experiments.map((e) => (
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
                  {e.notes && <div className="text-xs text-[var(--muted-foreground)] mt-1">{e.notes}</div>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {e.status === "planned" && <button onClick={() => updateStatus(e.id, "running")} className="p-1 hover:bg-blue-50 dark:hover:bg-blue-950 rounded" title="Start"><Play className="h-3.5 w-3.5 text-blue-500" /></button>}
                  {e.status === "running" && <button onClick={() => updateStatus(e.id, "completed")} className="p-1 hover:bg-green-50 dark:hover:bg-green-950 rounded" title="Complete"><CheckCircle className="h-3.5 w-3.5 text-green-500" /></button>}
                  {(e.status === "completed" || e.status === "running") && <button onClick={() => updateStatus(e.id, "archived")} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Archive"><Archive className="h-3.5 w-3.5" /></button>}
                  <button onClick={() => remove(e.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-950 rounded" title="Delete"><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
