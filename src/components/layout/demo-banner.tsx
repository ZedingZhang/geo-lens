"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";

export function DemoBanner() {
  const [visible] = useState(true);

  if (!visible) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-sm text-amber-800 dark:text-amber-200">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        <strong>Demo Mode</strong> — Do not enter sensitive information. Data
        is auto-cleared after 7 days.{" "}
        <span className="text-amber-600 dark:text-amber-400">
          LLM results are simulated.
        </span>
      </span>
    </div>
  );
}
