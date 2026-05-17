export type ExperimentStatus = "planned" | "running" | "completed" | "archived";

export const EXPERIMENT_STATUSES: ExperimentStatus[] = [
  "planned",
  "running",
  "completed",
  "archived",
];

export function computeDelta(
  baselineScore: number | null,
  afterScore: number | null
): number | null {
  if (baselineScore === null || afterScore === null) return null;
  return afterScore - baselineScore;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    planned: "Planned",
    running: "Running",
    completed: "Completed",
    archived: "Archived",
  };
  return map[status] ?? status;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "#22c55e";
    case "running":
      return "#3b82f6";
    case "planned":
      return "#a855f7";
    case "archived":
      return "#6b7280";
    default:
      return "#6b7280";
  }
}

export function getDeltaLabel(delta: number | null): string {
  if (delta === null) return "—";
  if (delta > 0) return `+${delta}`;
  return `${delta}`;
}

export function getDeltaColor(delta: number | null): string {
  if (delta === null) return "#6b7280";
  if (delta > 0) return "#22c55e";
  if (delta < 0) return "#ef4444";
  return "#6b7280";
}
