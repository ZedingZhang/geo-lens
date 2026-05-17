"use client";

import { useEffect, useState, use } from "react";
import { Loader2, FileDown, Copy, Check } from "lucide-react";

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<{ markdown: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}/report`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setReport(d);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  const copyAll = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    if (!report) return;
    const blob = new Blob([report.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `geo-lens-report-${id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (error) return <div className="p-6 max-w-4xl mx-auto"><div className="card p-8 text-center text-red-500">{error}</div></div>;
  if (!report) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">GEO Analysis Report</h1>
        <div className="flex gap-2">
          <button onClick={copyAll} className="flex items-center gap-1.5 px-3 py-2 border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--muted)]">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy Markdown"}
          </button>
          <button onClick={download} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90">
            <FileDown className="h-4 w-4" />Download .md
          </button>
        </div>
      </div>
      <div className="card p-6">
        <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">{report.markdown}</pre>
      </div>
    </div>
  );
}
