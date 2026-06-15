import { parseJsonField } from "@/lib/utils";

export type ContentMapStatus = "ok" | "weak" | "missing";
export type ContentPageType =
  | "homepage"
  | "about"
  | "comparison"
  | "faq"
  | "docs_blog"
  | "technical";

export interface MissingContentMapRow {
  geoNeed: string;
  existingPage: string;
  status: ContentMapStatus;
  suggestedPage: string;
  rationale: string;
  pageType: ContentPageType;
  priority: "high" | "medium" | "low";
}

export interface ContentPageGap {
  pageType: ContentPageType;
  label: string;
  gaps: string[];
  suggestedPages: string[];
}

export interface MissingContentMapResult {
  resultSource: "rules";
  summary: {
    totalNeeds: number;
    missing: number;
    weak: number;
    ok: number;
    highestPriorityPage: string;
  };
  pageGaps: ContentPageGap[];
  rows: MissingContentMapRow[];
}

export interface MissingContentMapInput {
  brandName: string;
  websiteUrl?: string | null;
  description?: string | null;
  product?: string | null;
  keywords?: string[] | string | null;
  competitors?: string[] | string | null;
  scores?: {
    entityClarity?: number;
    answerCoverage?: number;
    citationReadiness?: number;
    contentStructure?: number;
    freshnessSignal?: number;
  } | null;
  diagnoses?: Array<{
    failureType: string;
    severity?: string;
  }>;
  readinessChecks?: Array<{
    key: string;
    label: string;
    status: string;
  }>;
  questions?: Array<{
    question: string;
    brandMentioned: boolean;
  }>;
}

const PAGE_LABELS: Record<ContentPageType, string> = {
  homepage: "Homepage",
  about: "About page",
  comparison: "Comparison page",
  faq: "FAQ page",
  docs_blog: "Docs / Blog",
  technical: "Technical crawlability",
};

export function buildMissingContentMap(
  input: MissingContentMapInput
): MissingContentMapResult {
  const keywords = toArray(input.keywords);
  const competitors = toArray(input.competitors);
  const competitor = competitors[0] || "[competitor]";
  const description = input.description || "";
  const scores = input.scores || {};
  const failureTypes = new Set((input.diagnoses || []).map((d) => d.failureType));
  const readinessChecks = input.readinessChecks || [];
  const missedQuestions = (input.questions || []).filter((q) => !q.brandMentioned);

  const hasWebsite = Boolean(input.websiteUrl);
  const hasDateFacts = /\b(20\d{2}|updated|version|last updated|as of)\b/i.test(description);
  const hasNumericEvidence = /\b\d+[\d,.]*\b/.test(description);
  const hasDirectDefinition =
    /\bis a\b|\bis an\b|\bplatform\b|\btool\b|\bservice\b|\bsoftware\b/i.test(description);
  const productSummaryWeak = description.length < 120 || description.length > 420;
  const crawlIssue = readinessChecks.some((check) => {
    const key = check.key.toLowerCase();
    return check.status !== "pass" && (key.includes("robots") || key.includes("sitemap"));
  });
  const sitemapOk = hasWebsite && !crawlIssue;

  const rows: MissingContentMapRow[] = [
    {
      geoNeed: "entity definition",
      existingPage: "homepage",
      status:
        scores.entityClarity && scores.entityClarity >= 75 && hasDirectDefinition
          ? "ok"
          : "weak",
      suggestedPage: "improve homepage hero",
      rationale:
        failureTypes.has("AMBIGUOUS_BRAND_NAME") || failureTypes.has("NO_ENTITY_DEFINITION")
          ? "The brand boundary is not explicit enough for AI answer engines to cite confidently."
          : "The homepage should keep a short entity definition in the first screen.",
      pageType: "homepage",
      priority: "high",
    },
    {
      geoNeed: "concise product summary",
      existingPage: "homepage",
      status: productSummaryWeak ? "weak" : "ok",
      suggestedPage: "add citable product summary",
      rationale:
        "AI answers need a short, neutral product summary that can be copied into category and recommendation answers.",
      pageType: "homepage",
      priority: "high",
    },
    {
      geoNeed: "dated facts",
      existingPage: "homepage",
      status: hasDateFacts && (scores.freshnessSignal ?? 0) >= 65 ? "ok" : "weak",
      suggestedPage: "add dated update block",
      rationale:
        "Date-stamped facts give AI systems freshness signals and reduce ambiguity about whether the claim is current.",
      pageType: "homepage",
      priority: "medium",
    },
    {
      geoNeed: "citation evidence",
      existingPage: "about page",
      status:
        hasNumericEvidence && (scores.citationReadiness ?? 0) >= 70 ? "ok" : "weak",
      suggestedPage: "add dated metrics",
      rationale:
        "Numbers, benchmarks, methodology notes, and dated claims make the brand easier to cite as evidence.",
      pageType: "about",
      priority: "high",
    },
    {
      geoNeed: "credibility signal",
      existingPage: "about page",
      status: failureTypes.has("NO_AUTHOR_OR_ORG_CREDIBILITY") ? "missing" : "weak",
      suggestedPage: "add founder, team, and methodology section",
      rationale:
        "AI engines need author, organization, and methodology context before treating a page as a trustworthy source.",
      pageType: "about",
      priority: "medium",
    },
    {
      geoNeed: "external proof",
      existingPage: "about page",
      status: failureTypes.has("NO_EXTERNAL_REFERENCES") ? "missing" : "weak",
      suggestedPage: "add external references section",
      rationale:
        "Third-party references and public proof help corroborate owned content.",
      pageType: "about",
      priority: "medium",
    },
    {
      geoNeed: "comparison intent",
      existingPage: competitors.length > 0 ? "none" : "none",
      status: "missing",
      suggestedPage: `/compare/${slugify(competitor)}`,
      rationale:
        "Category recommendation prompts often ask for alternatives or comparisons before they mention a specific brand.",
      pageType: "comparison",
      priority: "high",
    },
    {
      geoNeed: "alternatives page",
      existingPage: "none",
      status: "missing",
      suggestedPage: "/alternatives",
      rationale:
        "An alternatives page gives AI systems objective comparison context for non-branded discovery prompts.",
      pageType: "comparison",
      priority: "medium",
    },
    {
      geoNeed: "answer-shaped content",
      existingPage: "FAQ page",
      status:
        missedQuestions.length > 0 || (scores.answerCoverage ?? 0) < 70
          ? "missing"
          : "weak",
      suggestedPage: "/faq",
      rationale:
        "Direct Q&A blocks map naturally to the way users ask AI answer engines for recommendations and explanations.",
      pageType: "faq",
      priority: "high",
    },
    {
      geoNeed: "problem discovery",
      existingPage: "blog",
      status: "missing",
      suggestedPage: `/blog/${slugify(keywords[0] || "use-case")}`,
      rationale:
        "Problem-oriented articles help the brand appear before users know which product or category to search for.",
      pageType: "docs_blog",
      priority: "medium",
    },
    {
      geoNeed: "benchmark or case study",
      existingPage: "docs / blog",
      status: hasNumericEvidence ? "weak" : "missing",
      suggestedPage: "/case-studies/benchmark",
      rationale:
        "Benchmarks and case studies provide quotable evidence for AI systems that need support for recommendations.",
      pageType: "docs_blog",
      priority: "medium",
    },
    {
      geoNeed: "technical crawlability",
      existingPage: "sitemap",
      status: sitemapOk ? "ok" : hasWebsite ? "weak" : "missing",
      suggestedPage: sitemapOk ? "no action" : "fix robots.txt and sitemap.xml",
      rationale:
        "Crawlable sitemap and robots rules help AI and search crawlers discover the strongest citation pages.",
      pageType: "technical",
      priority: sitemapOk ? "low" : "high",
    },
  ];

  const pageGaps = buildPageGaps(rows);
  const summary = {
    totalNeeds: rows.length,
    missing: rows.filter((row) => row.status === "missing").length,
    weak: rows.filter((row) => row.status === "weak").length,
    ok: rows.filter((row) => row.status === "ok").length,
    highestPriorityPage: pageGaps[0]?.label || PAGE_LABELS.homepage,
  };

  return {
    resultSource: "rules",
    summary,
    pageGaps,
    rows,
  };
}

export function formatContentMapStatus(status: ContentMapStatus): string {
  return status === "ok" ? "OK" : status;
}

function buildPageGaps(rows: MissingContentMapRow[]): ContentPageGap[] {
  const pageTypes: ContentPageType[] = [
    "homepage",
    "about",
    "comparison",
    "faq",
    "docs_blog",
    "technical",
  ];

  return pageTypes.map((pageType) => {
    const pageRows = rows.filter((row) => row.pageType === pageType);
    const needsAction = pageRows.filter((row) => row.status !== "ok");

    return {
      pageType,
      label: PAGE_LABELS[pageType],
      gaps: needsAction.map((row) => gapLabelForRow(row)),
      suggestedPages: Array.from(new Set(needsAction.map((row) => row.suggestedPage))),
    };
  });
}

function gapLabelForRow(row: MissingContentMapRow): string {
  const labels: Record<string, string> = {
    "entity definition": "Entity definition unclear",
    "concise product summary": "Missing concise product summary",
    "dated facts": "Missing dated facts",
    "citation evidence": "Missing dated metrics",
    "credibility signal": "No founder / team / credibility signal",
    "external proof": "No external proof",
    "comparison intent": "Missing [Brand] vs [Competitor]",
    "alternatives page": "Missing alternatives page",
    "answer-shaped content": "Missing direct Q&A blocks",
    "problem discovery": "Missing problem-oriented pages",
    "benchmark or case study": "Missing benchmark / case study",
    "technical crawlability": "Robots or sitemap issue",
  };

  return labels[row.geoNeed] || row.geoNeed;
}

function toArray(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return parseJsonField<string[]>(value, []);
  return [];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "competitor";
}
