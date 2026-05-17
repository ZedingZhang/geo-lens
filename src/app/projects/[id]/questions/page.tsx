"use client";

import { useEffect, useState, use } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link";
import { Loader2, Sparkles, MessageSquareText, Check, X, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [questions, setQuestions] = useState<Array<{
    id: string; question: string; intent: string;
    simulatedAnswer: string; brandMentioned: boolean;
    mentionReason: string; improvement: string; resultSource: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const fetchQuestions = async () => {
    const res = await fetch(`/api/projects/${id}`);
    const d = await res.json();
    setQuestions(d.project?.questions || []);
    setLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  const generate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}/questions`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setQuestions(d.questions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenerating(false);
    }
  };

  const copyQuestion = async (text: string, qid: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(qid);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">AI Answer Simulation</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Simulate how AI search engines answer questions about your brand
          </p>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {questions.length ? "Regenerate" : "Generate Questions"}
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 text-red-700 text-sm">{error}</div>}

      {questions.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquareText className="h-10 w-10 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)] mb-4">No questions generated yet.</p>
          <button onClick={generate} className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">
            Generate AI Questions
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="card p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2 min-w-0">
                  {q.brandMentioned ? (
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-medium text-sm">{q.question}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="badge badge-info text-[10px]">{q.intent}</span>
                      <span className={cn("badge text-[10px]", q.brandMentioned ? "badge-success" : "badge-error")}>
                        {q.brandMentioned ? "Brand Mentioned" : "Not Mentioned"}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => copyQuestion(q.question, q.id)} className="shrink-0 p-1 hover:bg-[var(--muted)] rounded text-[var(--muted-foreground)]">
                  {copied === q.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="bg-[var(--muted)] rounded-lg p-3 text-sm mb-2">
                <div className="text-xs text-[var(--muted-foreground)] mb-1">Simulated AI Answer:</div>
                {q.simulatedAnswer}
              </div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {q.brandMentioned ? (
                  <span className="text-green-600 dark:text-green-400">Why: {q.mentionReason}</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">Fix: {q.improvement}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
