"use client";

import { useEffect, useState, use } from "react";
import { Loader2, Sparkles, Map, Globe, FileText, Users, Video, BarChart3, Share2, BookOpen } from "lucide-react";
import { parseJsonField, cn } from "@/lib/utils";
import { getCoverageColor, getCoverageLabel } from "@/lib/geo/source-map";

const categoryIcon: Record<string, React.ElementType> = { owned_site: Globe, docs: FileText, third_party_articles: BookOpen, reviews: BarChart3, community: Users, video: Video, comparison_pages: Share2, social_profiles: Share2 };

export default function SourcesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [sources, setSources] = useState<Array<{
    id: string; category: string; coverage: string; influence: string;
    gap: string; recommendedStrategies: string[]; resultSource: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(d => {
        const items = d.project?.sourceMaps || [];
        setSources(items.map((s: Record<string, unknown>) => ({ ...s, recommendedStrategies: typeof s.recommendedStrategies === 'string' ? parseJsonField(s.recommendedStrategies, []) : (s.recommendedStrategies || []) })));
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [id]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${id}/sources`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setSources(d.sources.map((s: Record<string, unknown>) => ({ ...s, recommendedStrategies: typeof s.recommendedStrategies === 'string' ? parseJsonField(s.recommendedStrategies, []) : (s.recommendedStrategies || []) })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setGenerating(false); }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Citation Source Map</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Analyze which sources influence AI citations and where gaps exist</p>
        </div>
        <button onClick={generate} disabled={generating} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {sources.length ? "Regenerate" : "Generate Map"}
        </button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">{error}</div>}

      {sources.length === 0 ? (
        <div className="card p-12 text-center">
          <Map className="h-10 w-10 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)] mb-4">No source map generated yet.</p>
          <button onClick={generate} className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">Generate Source Map</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sources.map(s => {
            const Icon = categoryIcon[s.category] || Globe;
            return (
              <div key={s.id} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <h3 className="font-medium text-sm capitalize">{s.category.replace(/_/g, " ")}</h3>
                  <span className="badge text-[10px]" style={{ background: `${getCoverageColor(s.coverage)}20`, color: getCoverageColor(s.coverage) }}>{getCoverageLabel(s.coverage)}</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mb-2">{s.influence}</p>
                <div className="text-xs bg-[var(--muted)] rounded-lg p-2 mb-2">
                  <span className="font-medium">Gap: </span>{s.gap}
                </div>
                {s.recommendedStrategies.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {s.recommendedStrategies.map(st => <span key={st} className="badge badge-info text-[10px]">{st}</span>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
