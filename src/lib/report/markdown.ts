import { parseJsonField } from "@/lib/utils";

interface ProjectForReport {
  name: string;
  brandName: string;
  websiteUrl?: string | null;
  description?: string;
  analyses: Array<{
    totalScore: number;
    entityClarity: number;
    answerCoverage: number;
    citationReadiness: number;
    contentStructure: number;
    freshnessSignal: number;
    strengths: string;
    weaknesses: string;
    nextActions: string;
    resultSource: string;
  }>;
  questions: Array<{
    question: string;
    intent: string;
    simulatedAnswer: string;
    brandMentioned: boolean;
    mentionReason: string;
    improvement: string;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    content: string;
    priority: string;
  }>;
  diagnoses: Array<{
    failureType: string;
    severity: string;
    evidence: string;
    reason: string;
    fix: string;
    impactedDimension: string;
  }>;
  contentDiffs: Array<{
    sourceLabel: string;
    beforeContent: string;
    afterContent: string;
    changeSummary: string;
    rationale: string;
    impactedDimensions: string;
    addedElements: string;
  }>;
  readinessAudits: Array<{
    totalScore: number;
    checks: string;
    summary: string;
    resultSource: string;
  }>;
  promptItems: Array<{
    prompt: string;
    intentType: string;
    funnelStage: string;
    priority: string;
    demandScore: number;
  }>;
  sourceMaps: Array<{
    category: string;
    coverage: string;
    gap: string;
  }>;
  experiments: Array<{
    name: string;
    status: string;
    baselineScore: number | null;
    afterScore: number | null;
    delta: number | null;
  }>;
}

export function generateMarkdownReport(project: ProjectForReport): string {
  const analysis = project.analyses[0];
  const strengths = analysis ? parseJsonField<string[]>(analysis.strengths, []) : [];
  const weaknesses = analysis ? parseJsonField<string[]>(analysis.weaknesses, []) : [];
  const nextActions = analysis ? parseJsonField<string[]>(analysis.nextActions, []) : [];

  const sections: string[] = [];

  // Header
  sections.push(`# GEO Lens Analysis Report

## Project: ${project.name}
**Brand:** ${project.brandName}
${project.websiteUrl ? `**URL:** ${project.websiteUrl}` : ""}
**Generated:** ${new Date().toISOString().split("T")[0]}
**Mode:** ${analysis?.resultSource || "mock"}

---`);

  // GEO Score
  if (analysis) {
    sections.push(`## GEO Score Summary

| Dimension | Score |
|-----------|-------|
| Entity Clarity | ${analysis.entityClarity}/100 |
| Answer Coverage | ${analysis.answerCoverage}/100 |
| Citation Readiness | ${analysis.citationReadiness}/100 |
| Content Structure | ${analysis.contentStructure}/100 |
| Freshness Signal | ${analysis.freshnessSignal}/100 |
| **Total** | **${analysis.totalScore}/100** |

### Strengths
${strengths.map((s) => `- ${s}`).join("\n")}

### Weaknesses
${weaknesses.map((w) => `- ${w}`).join("\n")}

### Priority Actions
${nextActions.map((a, i) => `${i + 1}. ${a}`).join("\n")}
`);
  }

  // Questions
  if (project.questions.length > 0) {
    sections.push(`## AI Answer Simulation

${project.questions
  .map(
    (q) =>
      `### Q: ${q.question}
**Intent:** ${q.intent} | **Brand Mentioned:** ${q.brandMentioned ? "Yes" : "No"}

> ${q.simulatedAnswer}

${!q.brandMentioned ? `**Improvement:** ${q.improvement}` : `**Why:** ${q.mentionReason}`}
`
  )
  .join("\n")}`);
  }

  // Diagnostics
  if (project.diagnoses.length > 0) {
    sections.push(`## Citation Failure Diagnosis

${project.diagnoses
  .map(
    (d) =>
      `### ${d.failureType.replace(/_/g, " ")} — ${d.severity.toUpperCase()}
- **Evidence:** ${d.evidence}
- **Reason:** ${d.reason}
- **Fix:** ${d.fix}
- **Impact:** ${d.impactedDimension}
`
  )
  .join("\n")}`);
  }

  // Recommendations
  if (project.recommendations.length > 0) {
    sections.push(`## Content Optimization Recommendations

${project.recommendations
  .map((r) => `### [${r.priority.toUpperCase()}] ${r.title}\n${r.content}`)
  .join("\n\n")}`);
  }

  // Diffs
  if (project.contentDiffs.length > 0) {
    sections.push(`## Before / After GEO Diff

${project.contentDiffs
  .map(
    (d) =>
      `### ${d.sourceLabel}

**Before:**
> ${d.beforeContent.slice(0, 500)}

**After:**
> ${d.afterContent.slice(0, 500)}

**Changes:** ${parseJsonField<string[]>(d.changeSummary, []).join(", ")}
**Rationale:** ${d.rationale}
`
  )
  .join("\n")}`);
  }

  // Readiness
  if (project.readinessAudits.length > 0) {
    const audit = project.readinessAudits[0];
    const checks = parseJsonField<Array<{ label: string; status: string; fix: string }>>(audit.checks, []);
    sections.push(`## AI Readiness Technical Audit

**Score:** ${audit.totalScore}/100
**Summary:** ${audit.summary}

${checks
  .map((c) => `- **${c.label}** (${c.status}): ${c.fix || "No issues found."}`)
  .join("\n")}
`);
  }

  // Prompts
  if (project.promptItems.length > 0) {
    sections.push(`## Prompt Portfolio

${project.promptItems
  .map(
    (p) =>
      `- **[${p.priority}] ${p.prompt}** (${p.intentType}, ${p.funnelStage}, demand: ${p.demandScore})`
  )
  .join("\n")}`);
  }

  // Source Map
  if (project.sourceMaps.length > 0) {
    sections.push(`## Citation Source Map

${project.sourceMaps
  .map((s) => `- **${s.category}:** ${s.coverage} — ${s.gap.slice(0, 200)}`)
  .join("\n")}`);
  }

  // Experiments
  if (project.experiments.length > 0) {
    sections.push(`## Experiment Tracker

${project.experiments
  .map(
    (e) =>
      `- **${e.name}** — ${e.status} | Baseline: ${e.baselineScore ?? "—"} | After: ${e.afterScore ?? "—"} | Delta: ${e.delta ?? "—"}`
  )
  .join("\n")}`);
  }

  // Footer
  sections.push(`---

*Generated by GEO Lens — Generative Engine Optimization Platform*`);

  return sections.join("\n\n");
}
