"use client";

import { useEffect, useState, use } from "react";
import { Loader2, Sparkles, FileText, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RecommendationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [recs, setRecs] = useState<Array<{
    id: string; type: string; title: string; content: string; priority: string; resultSource: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(d => { setRecs(d.project?.recommendations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${id}/recommendations`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setRecs(d.recommendations);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setGenerating(false); }
  };

  const copy = async (text: string, rid: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(rid);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Content Recommendations</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">GEO-optimized content suggestions for your brand</p>
        </div>
        <button onClick={generate} disabled={generating} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {recs.length ? "Regenerate" : "Generate"}
        </button>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 text-red-700 text-sm">{error}</div>}

      {recs.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="h-10 w-10 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)] mb-4">No recommendations yet. Run GEO analysis first.</p>
          <button onClick={generate} className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">Generate Recommendations</button>
        </div>
      ) : (
        <div className="space-y-3">
          {recs.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{r.title}</h3>
                    <span className={cn("badge text-[10px]",
                      r.priority === "high" ? "badge-error" : r.priority === "medium" ? "badge-warning" : "badge-info"
                    )}>{r.priority}</span>
                    <span className="badge badge-info text-[10px]">{r.type}</span>
                  </div>
                </div>
                <button onClick={() => copy(r.content, r.id)} className="shrink-0 p-1 hover:bg-[var(--muted)] rounded text-[var(--muted-foreground)]">
                  {copied === r.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <pre className="bg-[var(--muted)] rounded-lg p-3 text-xs whitespace-pre-wrap font-mono">{r.content}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
