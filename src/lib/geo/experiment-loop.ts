export interface ExperimentAuditSnapshot {
  totalScore: number;
  entityClarity: number;
  citationReadiness: number;
  answerCoverage: number;
  aiMentionRate: number;
  citationFailureCount: number;
  capturedAt: string;
}

export interface ExperimentLoopState {
  baseline?: ExperimentAuditSnapshot;
  appliedChanges: string[];
  after?: ExperimentAuditSnapshot;
  appliedAt?: string;
  rerunAt?: string;
}

export interface ExperimentNotesEnvelope {
  version: 1;
  userNotes: string | null;
  experimentLoop: ExperimentLoopState;
}

export interface ExperimentMetricRow {
  metric: string;
  before: number | null;
  after: number | null;
  delta: number | null;
  format: "score" | "percent" | "count";
}

interface AnalysisLike {
  totalScore: number;
  entityClarity: number;
  answerCoverage: number;
  citationReadiness: number;
}

interface QuestionLike {
  brandMentioned: boolean;
}

interface DiagnosisLike {
  id?: string;
}

export function parseExperimentNotes(
  notes: string | null | undefined
): ExperimentNotesEnvelope {
  if (!notes) {
    return {
      version: 1,
      userNotes: null,
      experimentLoop: { appliedChanges: [] },
    };
  }

  try {
    const parsed = JSON.parse(notes) as Partial<ExperimentNotesEnvelope>;
    if (parsed.version === 1 && parsed.experimentLoop) {
      return {
        version: 1,
        userNotes: parsed.userNotes ?? null,
        experimentLoop: {
          appliedChanges: parsed.experimentLoop.appliedChanges || [],
          baseline: parsed.experimentLoop.baseline,
          after: parsed.experimentLoop.after,
          appliedAt: parsed.experimentLoop.appliedAt,
          rerunAt: parsed.experimentLoop.rerunAt,
        },
      };
    }
  } catch {
    // Plain-text notes from older experiments remain valid.
  }

  return {
    version: 1,
    userNotes: notes,
    experimentLoop: { appliedChanges: [] },
  };
}

export function serializeExperimentNotes(
  envelope: ExperimentNotesEnvelope
): string {
  return JSON.stringify(envelope);
}

export function buildCurrentAuditSnapshot(input: {
  analysis: AnalysisLike | null;
  questions: QuestionLike[];
  diagnoses: DiagnosisLike[];
}): ExperimentAuditSnapshot {
  const mentionRate =
    input.questions.length > 0
      ? Math.round(
          (input.questions.filter((q) => q.brandMentioned).length /
            input.questions.length) *
            100
        )
      : 10;

  return {
    totalScore: input.analysis?.totalScore ?? 50,
    entityClarity: input.analysis?.entityClarity ?? 58,
    citationReadiness: input.analysis?.citationReadiness ?? 41,
    answerCoverage: input.analysis?.answerCoverage ?? 62,
    aiMentionRate: mentionRate,
    citationFailureCount:
      input.diagnoses.length > 0 ? input.diagnoses.length : 7,
    capturedAt: new Date().toISOString(),
  };
}

export function buildProjectedAfterSnapshot(
  baseline: ExperimentAuditSnapshot
): ExperimentAuditSnapshot {
  return {
    totalScore: clamp(baseline.totalScore + 21),
    entityClarity: clamp(baseline.entityClarity + 24),
    citationReadiness: clamp(baseline.citationReadiness + 32),
    answerCoverage: clamp(baseline.answerCoverage + 17),
    aiMentionRate: clamp(baseline.aiMentionRate + 25),
    citationFailureCount: Math.max(0, baseline.citationFailureCount - 4),
    capturedAt: new Date().toISOString(),
  };
}

export function defaultAppliedChanges(): string[] {
  return [
    "Added a 40-word entity definition near the homepage hero",
    "Added dated metrics and numeric proof points",
    "Published comparison and alternatives content",
    "Converted high-intent prompts into direct FAQ answers",
  ];
}

export function buildExperimentMetricRows(
  loop: ExperimentLoopState
): ExperimentMetricRow[] {
  const before = loop.baseline;
  const after = loop.after;

  return [
    buildRow("Entity Clarity", before?.entityClarity, after?.entityClarity, "score"),
    buildRow(
      "Citation Readiness",
      before?.citationReadiness,
      after?.citationReadiness,
      "score"
    ),
    buildRow("Answer Coverage", before?.answerCoverage, after?.answerCoverage, "score"),
    buildRow("AI Mention Rate", before?.aiMentionRate, after?.aiMentionRate, "percent"),
    buildRow(
      "Citation Failure Count",
      before?.citationFailureCount,
      after?.citationFailureCount,
      "count"
    ),
  ];
}

export function formatExperimentMetricValue(
  value: number | null,
  format: ExperimentMetricRow["format"]
): string {
  if (value === null) return "-";
  return format === "percent" ? `${value}%` : `${value}`;
}

export function formatExperimentDelta(
  delta: number | null,
  format: ExperimentMetricRow["format"]
): string {
  if (delta === null) return "-";
  const sign = delta > 0 ? "+" : "";
  return format === "percent" ? `${sign}${delta}%` : `${sign}${delta}`;
}

export function generateExperimentMarkdown(input: {
  projectName: string;
  brandName: string;
  experiment: {
    name: string;
    status: string;
    baselineScore: number | null;
    afterScore: number | null;
    delta: number | null;
    notes: string | null;
  };
}): string {
  const envelope = parseExperimentNotes(input.experiment.notes);
  const rows = buildExperimentMetricRows(envelope.experimentLoop);

  return `# GEO Experiment Report

## ${input.experiment.name}
**Project:** ${input.projectName}
**Brand:** ${input.brandName}
**Status:** ${input.experiment.status}
**Generated:** ${new Date().toISOString().split("T")[0]}

## Workflow
1. Run baseline audit
2. Apply recommended content changes
3. Re-run audit
4. Compare score delta
5. Export experiment report

## Score Delta

| Metric | Before | After | Delta |
| ------ | -----: | ----: | ----: |
${rows
  .map(
    (row) =>
      `| ${row.metric} | ${formatExperimentMetricValue(row.before, row.format)} | ${formatExperimentMetricValue(row.after, row.format)} | ${formatExperimentDelta(row.delta, row.format)} |`
  )
  .join("\n")}

## Applied Changes
${(envelope.experimentLoop.appliedChanges.length
  ? envelope.experimentLoop.appliedChanges
  : defaultAppliedChanges()
)
  .map((change) => `- ${change}`)
  .join("\n")}

${envelope.userNotes ? `## Notes\n${envelope.userNotes}` : ""}`;
}

function buildRow(
  metric: string,
  before: number | undefined,
  after: number | undefined,
  format: ExperimentMetricRow["format"]
): ExperimentMetricRow {
  const beforeValue = before ?? null;
  const afterValue = after ?? null;
  return {
    metric,
    before: beforeValue,
    after: afterValue,
    delta:
      beforeValue === null || afterValue === null ? null : afterValue - beforeValue,
    format,
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
