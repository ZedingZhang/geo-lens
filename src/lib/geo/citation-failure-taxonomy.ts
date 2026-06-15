export const CITATION_FAILURE_TYPES = [
  "NO_INDEXABLE_PAGE",
  "NO_ENTITY_DEFINITION",
  "NO_DATE_STAMPED_FACTS",
  "NO_NUMERIC_EVIDENCE",
  "NO_AUTHOR_OR_ORG_CREDIBILITY",
  "NO_STRUCTURED_DATA",
  "NO_COMPARISON_CONTEXT",
  "NO_EXTERNAL_REFERENCES",
  "AMBIGUOUS_BRAND_NAME",
  "CONTENT_TOO_MARKETING_HEAVY",
  "CONTENT_NOT_ANSWER_SHAPED",
  "ROBOTS_OR_SITEMAP_ISSUE",
] as const;

export type CitationFailureType = (typeof CITATION_FAILURE_TYPES)[number];
export type CitationFailureSeverity = "high" | "medium" | "low";

export interface CitationFailureTaxonomyEntry {
  label: string;
  dimension: string;
  defaultSeverity: CitationFailureSeverity;
  description: string;
  impact: string;
  fix: string;
}

export interface CitationFailureCandidate {
  failureType: CitationFailureType;
  severity: CitationFailureSeverity;
  evidence: string;
  reason: string;
  fix: string;
  impactedDimension: string;
  relatedQuestion?: string;
}

interface CitationFailureJudgeInput {
  brandName: string;
  description: string;
  websiteUrl?: string | null;
  scores: {
    entityClarity: number;
    answerCoverage: number;
    citationReadiness: number;
    contentStructure: number;
    freshnessSignal: number;
  };
  questions: Array<{
    question: string;
    brandMentioned: boolean;
    simulatedAnswer: string;
  }>;
  readinessChecks?: Array<{
    key: string;
    label: string;
    status: string;
    impact: string;
    fix: string;
  }>;
}

export const CITATION_FAILURE_TAXONOMY: Record<
  CitationFailureType,
  CitationFailureTaxonomyEntry
> = {
  NO_INDEXABLE_PAGE: {
    label: "No indexable page",
    dimension: "Content Structure",
    defaultSeverity: "high",
    description: "The brand has no clear public page that an AI crawler can index and cite.",
    impact: "AI answer engines may skip the brand because there is no stable page to retrieve or quote.",
    fix: "Publish one canonical public page with crawlable HTML, title, meta description, and a concise brand summary.",
  },
  NO_ENTITY_DEFINITION: {
    label: "No entity definition",
    dimension: "Entity Clarity",
    defaultSeverity: "high",
    description: "The page does not state what the brand is in a short extractable definition.",
    impact: "AI answer engines may not know whether the brand is a product, service, company, person, or demo.",
    fix: "Add a 40-word entity definition near the top of the homepage.",
  },
  NO_DATE_STAMPED_FACTS: {
    label: "No date-stamped facts",
    dimension: "Freshness Signal",
    defaultSeverity: "medium",
    description: "The content lacks dated claims, version markers, launch dates, or update timestamps.",
    impact: "AI answer engines have fewer freshness signals and may prefer competitors with current facts.",
    fix: "Add last-updated dates, version notes, launch dates, or dated methodology statements.",
  },
  NO_NUMERIC_EVIDENCE: {
    label: "No numeric evidence",
    dimension: "Citation Readiness",
    defaultSeverity: "high",
    description: "The content lacks numbers, counts, ranges, benchmarks, or measurable proof points.",
    impact: "AI answer engines have little concrete evidence to quote in source-backed answers.",
    fix: "Add specific numbers such as supported engines, scoring dimensions, sample sizes, update cadence, or benchmark results.",
  },
  NO_AUTHOR_OR_ORG_CREDIBILITY: {
    label: "No author or org credibility",
    dimension: "Citation Readiness",
    defaultSeverity: "medium",
    description: "The page does not show who produced the content or why the organization is credible.",
    impact: "AI answer engines may avoid citing the page for trust-sensitive recommendations.",
    fix: "Add organization details, author bylines, methodology notes, credentials, and contact or repository links.",
  },
  NO_STRUCTURED_DATA: {
    label: "No structured data",
    dimension: "Content Structure",
    defaultSeverity: "medium",
    description: "The page lacks JSON-LD or schema markup for the organization, product, FAQ, or article.",
    impact: "AI and search systems must infer entity relationships from plain text instead of structured fields.",
    fix: "Add Organization, Product, SoftwareApplication, Article, and FAQPage schema where applicable.",
  },
  NO_COMPARISON_CONTEXT: {
    label: "No comparison context",
    dimension: "Entity Clarity",
    defaultSeverity: "medium",
    description: "The content does not position the brand against known alternatives or adjacent categories.",
    impact: "AI answer engines may not include the brand in category recommendation or comparison answers.",
    fix: "Add objective comparison sections naming alternatives, ideal customer profiles, and clear differentiators.",
  },
  NO_EXTERNAL_REFERENCES: {
    label: "No external references",
    dimension: "Citation Readiness",
    defaultSeverity: "medium",
    description: "There are no third-party references, reviews, docs, repositories, or citations supporting the brand.",
    impact: "AI answer engines may trust better corroborated competitors over the brand's owned page.",
    fix: "Link to reputable external mentions, docs, GitHub, changelogs, reviews, or third-party articles.",
  },
  AMBIGUOUS_BRAND_NAME: {
    label: "Ambiguous brand name",
    dimension: "Entity Clarity",
    defaultSeverity: "high",
    description: "The brand boundary or category is unclear from the available content.",
    impact: "AI answer engines may avoid citing the page because the entity boundary is unclear.",
    fix: "Clarify the brand category, audience, product type, and use case in the first screen of the page.",
  },
  CONTENT_TOO_MARKETING_HEAVY: {
    label: "Content too marketing heavy",
    dimension: "Citation Readiness",
    defaultSeverity: "medium",
    description: "The content relies on promotional claims instead of neutral, verifiable statements.",
    impact: "AI answer engines may summarize the page but avoid citing it as evidence.",
    fix: "Replace vague claims with factual definitions, methodology, limitations, examples, and proof points.",
  },
  CONTENT_NOT_ANSWER_SHAPED: {
    label: "Content not answer shaped",
    dimension: "Answer Coverage",
    defaultSeverity: "medium",
    description: "The content does not directly answer the natural-language questions users ask AI systems.",
    impact: "AI answer engines may use generic category knowledge instead of citing the brand page.",
    fix: "Add FAQ-style sections with concise answers to problem-aware, comparison, and buying-intent questions.",
  },
  ROBOTS_OR_SITEMAP_ISSUE: {
    label: "Robots or sitemap issue",
    dimension: "Content Structure",
    defaultSeverity: "high",
    description: "Robots.txt, sitemap.xml, or crawl guidance may prevent discovery or prioritization.",
    impact: "AI crawlers may miss the page, avoid the page, or fail to find the best citation URL.",
    fix: "Verify robots.txt, sitemap.xml, canonical URLs, and AI crawler rules for public content.",
  },
};

const FAILURE_PRIORITY: Record<CitationFailureType, number> = {
  AMBIGUOUS_BRAND_NAME: 0,
  NO_ENTITY_DEFINITION: 1,
  NO_INDEXABLE_PAGE: 2,
  ROBOTS_OR_SITEMAP_ISSUE: 3,
  NO_NUMERIC_EVIDENCE: 4,
  NO_DATE_STAMPED_FACTS: 5,
  NO_STRUCTURED_DATA: 6,
  CONTENT_NOT_ANSWER_SHAPED: 7,
  NO_COMPARISON_CONTEXT: 8,
  NO_AUTHOR_OR_ORG_CREDIBILITY: 9,
  NO_EXTERNAL_REFERENCES: 10,
  CONTENT_TOO_MARKETING_HEAVY: 11,
};

const SEVERITY_PRIORITY: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const LEGACY_FAILURE_TYPE_MAP: Record<string, CitationFailureType> = {
  entity_ambiguity: "AMBIGUOUS_BRAND_NAME",
  intent_mismatch: "CONTENT_NOT_ANSWER_SHAPED",
  missing_citable_facts: "NO_NUMERIC_EVIDENCE",
  weak_comparison_context: "NO_COMPARISON_CONTEXT",
  over_marketing: "CONTENT_TOO_MARKETING_HEAVY",
  freshness_gap: "NO_DATE_STAMPED_FACTS",
  structure_gap: "NO_STRUCTURED_DATA",
};

export function isCitationFailureType(value: string): value is CitationFailureType {
  return CITATION_FAILURE_TYPES.includes(value as CitationFailureType);
}

export function normalizeCitationFailureType(value: string): CitationFailureType {
  if (isCitationFailureType(value)) return value;
  return LEGACY_FAILURE_TYPE_MAP[value] || "CONTENT_NOT_ANSWER_SHAPED";
}

export function getCitationFailureLabel(value: string): string {
  return CITATION_FAILURE_TAXONOMY[normalizeCitationFailureType(value)].label;
}

export function selectPrimaryCitationFailure<T extends { failureType: string; severity: string }>(
  failures: T[]
): T | null {
  if (failures.length === 0) return null;

  return [...failures].sort((a, b) => {
    const severityDelta =
      (SEVERITY_PRIORITY[a.severity] ?? 99) - (SEVERITY_PRIORITY[b.severity] ?? 99);
    if (severityDelta !== 0) return severityDelta;

    return (
      FAILURE_PRIORITY[normalizeCitationFailureType(a.failureType)] -
      FAILURE_PRIORITY[normalizeCitationFailureType(b.failureType)]
    );
  })[0];
}

export function normalizeCitationFailureCandidate(
  candidate: CitationFailureCandidate
): CitationFailureCandidate {
  const failureType = normalizeCitationFailureType(candidate.failureType);
  const taxonomy = CITATION_FAILURE_TAXONOMY[failureType];

  return {
    failureType,
    severity: candidate.severity || taxonomy.defaultSeverity,
    evidence: candidate.evidence || taxonomy.description,
    reason: candidate.reason || taxonomy.impact,
    fix: candidate.fix || taxonomy.fix,
    impactedDimension: candidate.impactedDimension || taxonomy.dimension,
    relatedQuestion: candidate.relatedQuestion,
  };
}

export function buildRuleBasedCitationFailures(
  input: CitationFailureJudgeInput
): CitationFailureCandidate[] {
  const failures: CitationFailureCandidate[] = [];
  const missedQuestions = input.questions.filter((q) => !q.brandMentioned);
  const description = input.description.toLowerCase();
  const marketingWords = ["best", "leading", "powerful", "revolutionary", "world-class"];

  if (!input.websiteUrl) {
    failures.push(createFailure("NO_INDEXABLE_PAGE", "high", "No website URL is attached to the project."));
  }

  if (input.scores.entityClarity < 65 || input.description.length < 140) {
    failures.push(
      createFailure(
        "AMBIGUOUS_BRAND_NAME",
        "high",
        `The available description does not clearly define whether ${input.brandName} is a company, product, service, research tool, or demo.`
      )
    );
  }

  if (
    !/\bis a\b|\bis an\b|\bplatform\b|\btool\b|\bservice\b|\bsoftware\b/i.test(
      input.description
    )
  ) {
    failures.push(
      createFailure(
        "NO_ENTITY_DEFINITION",
        "high",
        "The project description lacks a direct entity-definition sentence."
      )
    );
  }

  if (!/\b\d+[\d,.]*\b/.test(input.description) || input.scores.citationReadiness < 60) {
    failures.push(
      createFailure(
        "NO_NUMERIC_EVIDENCE",
        "high",
        "The available content does not expose enough numeric proof points for citation."
      )
    );
  }

  if (!/\b(20\d{2}|updated|version|last updated|as of)\b/i.test(input.description)) {
    failures.push(
      createFailure(
        "NO_DATE_STAMPED_FACTS",
        "medium",
        "The available content lacks dated facts, version markers, or update timestamps."
      )
    );
  }

  if (missedQuestions.length > 0 || input.scores.answerCoverage < 65) {
    failures.push(
      createFailure(
        "CONTENT_NOT_ANSWER_SHAPED",
        "medium",
        missedQuestions[0]
          ? `The simulated question "${missedQuestions[0].question}" did not mention the brand.`
          : "Answer coverage is below the threshold for reliable AI extraction.",
        missedQuestions[0]?.question
      )
    );
  }

  if (input.scores.contentStructure < 70) {
    failures.push(
      createFailure(
        "NO_STRUCTURED_DATA",
        "medium",
        "Content structure score indicates missing schema, FAQ, table, or extractable structure signals."
      )
    );
  }

  if (marketingWords.some((word) => description.includes(word))) {
    failures.push(
      createFailure(
        "CONTENT_TOO_MARKETING_HEAVY",
        "medium",
        "The content includes broad promotional language that is harder for AI systems to cite as evidence."
      )
    );
  }

  for (const check of input.readinessChecks || []) {
    const key = check.key.toLowerCase();
    if (
      check.status !== "pass" &&
      (key.includes("robots") || key.includes("sitemap") || key.includes("crawler"))
    ) {
      failures.push(createFailure("ROBOTS_OR_SITEMAP_ISSUE", "high", check.impact));
    }

    if (check.status !== "pass" && key.includes("schema")) {
      failures.push(createFailure("NO_STRUCTURED_DATA", "medium", check.impact));
    }
  }

  return dedupeFailures(failures).slice(0, 6);
}

export function mergeCitationFailures(
  llmFailures: CitationFailureCandidate[],
  ruleFailures: CitationFailureCandidate[]
): CitationFailureCandidate[] {
  return dedupeFailures([...llmFailures, ...ruleFailures])
    .sort((a, b) => {
      const primary = selectPrimaryCitationFailure([a, b]);
      return primary === a ? -1 : 1;
    })
    .slice(0, 6);
}

function createFailure(
  failureType: CitationFailureType,
  severity: CitationFailureSeverity,
  evidence: string,
  relatedQuestion?: string
): CitationFailureCandidate {
  const taxonomy = CITATION_FAILURE_TAXONOMY[failureType];

  return {
    failureType,
    severity,
    evidence,
    reason: taxonomy.impact,
    fix: taxonomy.fix,
    impactedDimension: taxonomy.dimension,
    relatedQuestion,
  };
}

function dedupeFailures(failures: CitationFailureCandidate[]): CitationFailureCandidate[] {
  const byType = new Map<CitationFailureType, CitationFailureCandidate>();

  for (const rawFailure of failures) {
    const failure = normalizeCitationFailureCandidate(rawFailure);
    const existing = byType.get(failure.failureType);
    if (!existing) {
      byType.set(failure.failureType, failure);
      continue;
    }

    const winner = selectPrimaryCitationFailure([existing, failure]);
    byType.set(failure.failureType, winner || existing);
  }

  return Array.from(byType.values());
}
