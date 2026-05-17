import type { ContentDiff } from "@/lib/llm/schemas";

export function formatDiffForDisplay(diff: ContentDiff): {
  changes: string[];
  dimensions: string[];
  addedElements: string[];
  sourceLabel: string;
  before: string;
  after: string;
  rationale: string;
} {
  return {
    changes: diff.changeSummary,
    dimensions: diff.impactedDimensions,
    addedElements: diff.addedElements.map(formatAddedElement),
    sourceLabel: diff.sourceLabel,
    before: diff.beforeContent,
    after: diff.afterContent,
    rationale: diff.rationale,
  };
}

function formatAddedElement(el: string): string {
  const map: Record<string, string> = {
    entity_definition: "Entity Definition",
    citable_summary: "Citable Summary",
    faq_hint: "FAQ Content",
    evidence: "Evidence / Facts",
    comparison: "Comparison Context",
    freshness_marker: "Freshness Marker",
    schema_hint: "Structured Data",
  };
  return map[el] ?? el;
}

export function generateDiffSummary(
  changes: string[],
  dimensions: string[]
): string {
  return `Made ${changes.length} changes impacting ${dimensions.length} GEO dimensions: ${dimensions.join(", ")}.`;
}

export function estimateScoreImprovement(
  dimensions: string[]
): Record<string, number> {
  const estimates: Record<string, number> = {
    "Entity Clarity": 8,
    "Answer Coverage": 10,
    "Citation Readiness": 12,
    "Content Structure": 6,
    "Freshness Signal": 5,
  };

  const result: Record<string, number> = {};
  for (const dim of dimensions) {
    result[dim] = estimates[dim] ?? 5;
  }
  return result;
}
