export interface ReadinessCheck {
  key: string;
  label: string;
  status: "pass" | "warning" | "fail";
  impact: string;
  fix: string;
  relatedStrategies: string[];
}

export interface ReadinessAudit {
  totalScore: number;
  checks: ReadinessCheck[];
  summary: string;
}

export function getReadinessScoreGrade(score: number): {
  label: string;
  color: string;
} {
  if (score >= 80) return { label: "Ready", color: "#22c55e" };
  if (score >= 60) return { label: "Needs Work", color: "#eab308" };
  return { label: "At Risk", color: "#ef4444" };
}

export function countReadinessByStatus(
  checks: ReadinessCheck[]
): { pass: number; warning: number; fail: number } {
  return {
    pass: checks.filter((c) => c.status === "pass").length,
    warning: checks.filter((c) => c.status === "warning").length,
    fail: checks.filter((c) => c.status === "fail").length,
  };
}

export function getReadinessRecommendations(
  audit: ReadinessAudit
): string[] {
  return audit.checks
    .filter((c) => c.status !== "pass")
    .map((c) => c.fix);
}

export const READINESS_CHECK_TEMPLATES: ReadinessCheck[] = [
  {
    key: "robots_txt",
    label: "robots.txt",
    status: "warning",
    impact:
      "Without proper robots.txt, AI crawlers may or may not access your content as intended.",
    fix: "Ensure robots.txt exists and does not block legitimate AI crawlers.",
    relatedStrategies: ["llms-txt-hint"],
  },
  {
    key: "sitemap_xml",
    label: "sitemap.xml",
    status: "warning",
    impact:
      "AI and traditional crawlers use sitemaps to discover your content structure.",
    fix: "Add a sitemap.xml listing key pages with lastmod dates.",
    relatedStrategies: [],
  },
  {
    key: "llms_txt",
    label: "llms.txt",
    status: "fail",
    impact:
      "AI answer engines may not find a concise project summary without llms.txt.",
    fix: "Add /llms.txt with product summary, key pages, and documentation links.",
    relatedStrategies: ["llms-txt-hint", "citable-summary"],
  },
  {
    key: "meta_tags",
    label: "Meta Tags",
    status: "warning",
    impact:
      "Missing or weak meta tags reduce discoverability in both traditional and AI search.",
    fix: "Add unique title, meta description, and H1 to each key page.",
    relatedStrategies: ["entity-definition"],
  },
  {
    key: "extractable_structure",
    label: "Extractable Structure",
    status: "warning",
    impact:
      "AI engines prefer content with clear headings, FAQs, lists, and definition blocks.",
    fix: "Add FAQ sections, definition paragraphs, and structured lists to key pages.",
    relatedStrategies: ["faq-expansion", "citable-summary"],
  },
  {
    key: "jsonld_schema",
    label: "JSON-LD Schema",
    status: "warning",
    impact:
      "Structured data helps AI engines understand your entity type, products, and FAQs.",
    fix: "Add Organization, FAQPage, and Product JSON-LD schema.",
    relatedStrategies: ["structured-data"],
  },
  {
    key: "server_rendered",
    label: "Server-Rendered Content",
    status: "pass",
    impact:
      "Client-only rendered content may not be accessible to all AI crawlers.",
    fix: "Ensure key content is available in server-rendered HTML.",
    relatedStrategies: [],
  },
  {
    key: "ai_crawler_rules",
    label: "AI Crawler Rules",
    status: "warning",
    impact:
      "Some AI crawlers have specific rules in robots.txt that may block content extraction.",
    fix: "Check robots.txt for rules blocking GPTBot, Claude-Web, PerplexityBot, or Google-Extended.",
    relatedStrategies: ["llms-txt-hint"],
  },
];
