"use client";

import { useEffect, useState, use } from "react";
import { Loader2, Sparkles, GitCompare, Copy, Check, ArrowRight } from "lucide-react";
import { parseJsonField } from "@/lib/utils";

export default function DiffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [diffs, setDiffs] = useState<Array<{
    id: string; sourceLabel: string; beforeContent: string; afterContent: string;
    changeSummary: string; rationale: string; impactedDimensions: string; addedElements: string; resultSource: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(d => { setDiffs(d.project?.contentDiffs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${id}/diff`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setDiffs([d.diff]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setGenerating(false); }
  };

  const copyText = async (text: string, diffId: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(diffId);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Before / After GEO Diff</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">See how content changes improve GEO readiness</p>
        </div>
        <button onClick={generate} disabled={generating} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate Diff
        </button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {diffs.length === 0 ? (
        <div className="card p-12 text-center">
          <GitCompare className="h-10 w-10 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)] mb-4">No diff generated yet.</p>
          <button onClick={generate} className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">Generate Before/After Diff</button>
        </div>
      ) : (
        diffs.map((diff) => {
          const changes = parseJsonField<string[]>(diff.changeSummary, []);
          const dimensions = parseJsonField<string[]>(diff.impactedDimensions, []);
          const elements = parseJsonField<string[]>(diff.addedElements, []);
          return (
            <div key={diff.id} className="space-y-4">
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge badge-info text-[10px]">{diff.resultSource}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{diff.sourceLabel}</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">BEFORE</div>
                    <div className="bg-red-50 dark:bg-red-950 rounded-lg p-3 text-sm whitespace-pre-wrap border border-red-200 dark:border-red-800">{diff.beforeContent}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                      AFTER
                      <button onClick={() => copyText(diff.afterContent, diff.id)} className="p-0.5 hover:bg-[var(--muted)] rounded">
                        {copied === diff.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-sm whitespace-pre-wrap border border-green-200 dark:border-green-800">{diff.afterContent}</div>
                  </div>
                </div>
              </div>

              <div className="card p-4">
                <h3 className="font-medium text-sm mb-2">Changes Made</h3>
                <ul className="space-y-1 mb-3">
                  {changes.map((c, i) => <li key={i} className="text-sm flex items-start gap-2"><ArrowRight className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />{c}</li>)}
                </ul>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {dimensions.map(d => <span key={d} className="badge badge-success text-[10px]">{d}</span>)}
                  {elements.map(e => <span key={e} className="badge badge-info text-[10px]">{e}</span>)}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]"><span className="font-medium">Rationale:</span> {diff.rationale}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
