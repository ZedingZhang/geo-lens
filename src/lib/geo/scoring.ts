import {
  matchStrategies,
  type StrategyItem,
} from "./strategies";

export interface GeoScore {
  totalScore: number;
  entityClarity: number;
  answerCoverage: number;
  citationReadiness: number;
  contentStructure: number;
  freshnessSignal: number;
}

export function normalizeScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function computeAverageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return normalizeScore(
    scores.reduce((sum, s) => sum + s, 0) / scores.length
  );
}

export function scoreToLabel(score: number): "excellent" | "good" | "fair" | "poor" {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

export function scoreToColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

export interface DimensionDef {
  key: keyof GeoScore;
  label: string;
  description: string;
}

export const GEO_DIMENSIONS: DimensionDef[] = [
  {
    key: "entityClarity",
    label: "Entity Clarity",
    description: "How clearly defined is the brand entity for AI recognition?",
  },
  {
    key: "answerCoverage",
    label: "Answer Coverage",
    description:
      "How well does the content answer questions users ask AI engines?",
  },
  {
    key: "citationReadiness",
    label: "Citation Readiness",
    description:
      "How likely is the content to be cited or quoted by AI answer engines?",
  },
  {
    key: "contentStructure",
    label: "Content Structure",
    description:
      "How well structured is the content for AI extraction and parsing?",
  },
  {
    key: "freshnessSignal",
    label: "Freshness Signal",
    description:
      "How current and well-maintained does the content appear to AI crawlers?",
  },
];

export function getLowestDimensions(
  scores: GeoScore,
  count: number = 2
): DimensionDef[] {
  return GEO_DIMENSIONS.filter((d) => d.key !== "totalScore")
    .sort((a, b) => (scores[a.key] ?? 0) - (scores[b.key] ?? 0))
    .slice(0, count);
}

export function getScoreSummary(scores: GeoScore): {
  label: string;
  color: string;
  strengths: string[];
  weaknesses: string[];
} {
  const goodDimensions = GEO_DIMENSIONS.filter(
    (d) => d.key !== "totalScore" && (scores[d.key] ?? 0) >= 60
  );
  const badDimensions = GEO_DIMENSIONS.filter(
    (d) => d.key !== "totalScore" && (scores[d.key] ?? 0) < 60
  );

  return {
    label: scoreToLabel(scores.totalScore),
    color: scoreToColor(scores.totalScore),
    strengths: goodDimensions.map((d) => d.label),
    weaknesses: badDimensions.map((d) => d.label),
  };
}

export function recommendStrategiesForScores(
  scores: GeoScore
): StrategyItem[] {
  const failureTypes: string[] = [];
  const dimensions: string[] = [];

  if (scores.entityClarity < 60) {
    failureTypes.push("entity_ambiguity");
    dimensions.push("Entity Clarity");
  }
  if (scores.answerCoverage < 60) {
    failureTypes.push("intent_mismatch");
    dimensions.push("Answer Coverage");
  }
  if (scores.citationReadiness < 60) {
    failureTypes.push("missing_citable_facts");
    dimensions.push("Citation Readiness");
  }
  if (scores.contentStructure < 60) {
    failureTypes.push("structure_gap");
    dimensions.push("Content Structure");
  }
  if (scores.freshnessSignal < 60) {
    failureTypes.push("freshness_gap");
    dimensions.push("Freshness Signal");
  }

  return matchStrategies(failureTypes, dimensions);
}
