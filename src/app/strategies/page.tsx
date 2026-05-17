"use client";

import { useState } from "react";
import { STRATEGY_LIBRARY } from "@/lib/geo/strategies";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const DIMENSIONS = ["all", "Entity Clarity", "Answer Coverage", "Citation Readiness", "Content Structure", "Freshness Signal"];
const CATEGORIES = ["all", "content", "technical", "comparison", "freshness"];
const PRIORITIES = ["all", "high", "medium", "low"];

export default function StrategiesPage() {
  const [dimension, setDimension] = useState("all");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");

  const filtered = STRATEGY_LIBRARY.filter(s => {
    if (dimension !== "all" && !s.impactedDimensions.some(d => d === dimension)) return false;
    if (category !== "all" && s.category !== category) return false;
    if (priority !== "all" && s.priority !== priority) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Strategy Library</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Reusable GEO optimization strategies based on best practices for AI answer engine visibility
        </p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          <span className="text-[var(--muted-foreground)]">Dimension:</span>
          <select value={dimension} onChange={e => setDimension(e.target.value)} className="px-2 py-1 border border-[var(--border)] rounded-md text-xs bg-[var(--card)]">
            {DIMENSIONS.map(d => <option key={d} value={d}>{d === "all" ? "All" : d}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[var(--muted-foreground)]">Category:</span>
          <select value={category} onChange={e => setCategory(e.target.value)} className="px-2 py-1 border border-[var(--border)] rounded-md text-xs bg-[var(--card)]">
            {CATEGORIES.map(c => <option key={c} value={c}>{c === "all" ? "All" : c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[var(--muted-foreground)]">Priority:</span>
          <select value={priority} onChange={e => setPriority(e.target.value)} className="px-2 py-1 border border-[var(--border)] rounded-md text-xs bg-[var(--card)]">
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(s => (
          <div key={s.id} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm">{s.name}</h3>
              <span className={cn("badge text-[10px] shrink-0",
                s.priority === "high" ? "badge-error" : s.priority === "medium" ? "badge-warning" : "badge-info"
              )}>{s.priority}</span>
            </div>
            <div className="text-xs text-[var(--muted-foreground)] mb-3 space-y-1.5">
              <div><span className="font-medium text-foreground">Problem:</span> {s.problem}</div>
              <div><span className="font-medium text-foreground">When:</span> {s.whenToUse}</div>
            </div>
            <div className="bg-[var(--muted)] rounded-lg p-3 mb-3">
              <div className="text-[10px] text-[var(--muted-foreground)] mb-1">BEFORE</div>
              <div className="text-xs text-red-600 dark:text-red-400 mb-2">{s.beforeExample}</div>
              <div className="text-[10px] text-[var(--muted-foreground)] mb-1">AFTER</div>
              <div className="text-xs text-green-600 dark:text-green-400">{s.afterExample}</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {s.impactedDimensions.map(d => <span key={d} className="badge badge-info text-[10px]">{d}</span>)}
              <span className="badge text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{s.category}</span>
            </div>
            <div className="text-[10px] text-[var(--muted-foreground)] mt-2">{s.implementationHint}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center text-sm text-[var(--muted-foreground)]">No strategies match the current filters.</div>
      )}
    </div>
  );
}
