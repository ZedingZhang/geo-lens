"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GEO_DIMENSIONS } from "@/lib/geo/scoring";

type DimensionScores = {
  entityClarity: number;
  answerCoverage: number;
  citationReadiness: number;
  contentStructure: number;
  freshnessSignal: number;
};

interface ScoreChartProps {
  scores: DimensionScores;
}

function getColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

export function ScoreChart({ scores }: ScoreChartProps) {
  const data = GEO_DIMENSIONS.filter((d) => d.key !== "totalScore").map(
    (dim) => {
      const s = dim.key === "totalScore" ? 0 : scores[dim.key];
      return {
        name: dim.label.split(" ")[0],
        fullName: dim.label,
        score: s,
        fill: getColor(s),
      };
    }
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={{ stroke: "var(--border)" }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={{ stroke: "var(--border)" }}
        />
        <Tooltip
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
          formatter={(value) => [`${String(value)}/100`, "Score"]}
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        />
        <Bar dataKey="score" radius={[4, 4, 0, 0]} fill="var(--primary)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
