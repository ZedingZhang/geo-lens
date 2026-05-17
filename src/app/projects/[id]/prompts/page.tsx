"use client";

import { useEffect, useState, use } from "react";
import { Loader2, Sparkles, Lightbulb, Copy, Check } from "lucide-react";
import { parseJsonField } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function PromptsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [prompts, setPrompts] = useState<Array<{
    id: string; prompt: string; intentType: string; funnelStage: string;
    priority: string; targetKeyword: string | null; expectedBrands: string[]; demandScore: number; resultSource: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(d => {
        const items = d.project?.promptItems || [];
        setPrompts(items.map((p: Record<string, unknown>) => ({
          ...p,
          expectedBrands: typeof p.expectedBrands === 'string' ? parseJsonField(p.expectedBrands, []) : (p.expectedBrands || [])
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${id}/prompts`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setPrompts(d.prompts.map((p: Record<string, unknown>) => ({
        ...p,
        expectedBrands: typeof p.expectedBrands === 'string' ? parseJsonField(p.expectedBrands, []) : (p.expectedBrands || [])
      })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setGenerating(false); }
  };

  const copy = async (text: string, pid: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(pid);
    setTimeout(() => setCopied(null), 2000);
  };

  const intentTypes = ["all", ...new Set(prompts.map(p => p.intentType))];
  const filtered = filter === "all" ? prompts : prompts.filter(p => p.intentType === filter);

  const intentLabel = (t: string) => ({ branded: "Branded", non_branded_category: "Category", comparison: "Comparison", buyer_intent: "Buyer", problem_aware: "Problem", competitor: "Competitor" } as Record<string, string>)[t] || t;

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Prompt Portfolio</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Track AI search queries that matter for your brand</p>
        </div>
        <button onClick={generate} disabled={generating} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {prompts.length ? "Regenerate" : "Generate Prompts"}
        </button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">{error}</div>}

      {prompts.length === 0 ? (
        <div className="card p-12 text-center">
          <Lightbulb className="h-10 w-10 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)] mb-4">No prompts generated yet.</p>
          <button onClick={generate} className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">Generate Prompt Portfolio</button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            {intentTypes.map(t => (
              <button key={t} onClick={() => setFilter(t)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors", filter === t ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]")}>{t === "all" ? "All Intents" : intentLabel(t)}</button>
            ))}
          </div>
          <div className="grid gap-2">
            {filtered.map(p => (
              <div key={p.id} className="card p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium truncate">{p.prompt}</span>
                    <span className={cn("badge text-[10px] shrink-0", p.priority === "high" ? "badge-error" : p.priority === "medium" ? "badge-warning" : "badge-info")}>{p.priority}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <span>{intentLabel(p.intentType)}</span>
                    <span>·</span>
                    <span>{p.funnelStage}</span>
                    {p.targetKeyword && <><span>·</span><span>{p.targetKeyword}</span></>}
                    <span>·</span>
                    <span>Demand: {p.demandScore}</span>
                  </div>
                </div>
                <button onClick={() => copy(p.prompt, p.id)} className="shrink-0 p-1 hover:bg-[var(--muted)] rounded text-[var(--muted-foreground)]">
                  {copied === p.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
