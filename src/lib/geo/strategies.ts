export interface StrategyItem {
  id: string;
  name: string;
  problem: string;
  whenToUse: string;
  impactedDimensions: string[];
  priority: "high" | "medium" | "low";
  beforeExample: string;
  afterExample: string;
  implementationHint: string;
  applicableFailureTypes: string[];
  category: "content" | "technical" | "comparison" | "freshness";
}

export const STRATEGY_LIBRARY: StrategyItem[] = [
  {
    id: "entity-definition",
    name: "Entity Definition",
    problem:
      "AI engines cannot clearly identify what your brand or product is.",
    whenToUse:
      "Use when entity clarity score is low or brand is not mentioned in simulated answers.",
    impactedDimensions: ["Entity Clarity", "Citation Readiness"],
    priority: "high",
    beforeExample: "We help teams improve their online presence.",
    afterExample:
      "GEO Lens is a generative engine optimization platform for content teams and personal brands. It evaluates whether a brand can be discovered, summarized, and cited by AI answer engines like ChatGPT, Perplexity, and Google AI Overviews.",
    implementationHint:
      "Add a clear one-sentence entity definition near the top of the page, including what you do and who it's for.",
    applicableFailureTypes: ["entity_ambiguity"],
    category: "content",
  },
  {
    id: "citable-summary",
    name: "Citable Summary",
    problem:
      "The page has useful information but no concise passage that an AI answer engine can quote directly.",
    whenToUse:
      "Use when citation readiness is low or simulated answers omit the brand.",
    impactedDimensions: ["Citation Readiness", "Answer Coverage"],
    priority: "high",
    beforeExample: "We help teams improve AI visibility.",
    afterExample:
      "GEO Lens is a generative engine optimization audit tool for small content teams. It evaluates whether a brand can be discovered, summarized, and cited by AI answer engines.",
    implementationHint:
      "Add a 2-3 sentence factual summary near the top of the page that an AI can quote verbatim.",
    applicableFailureTypes: ["missing_citable_facts", "over_marketing"],
    category: "content",
  },
  {
    id: "faq-expansion",
    name: "FAQ Expansion",
    problem:
      "The page doesn't answer high-intent questions that users ask AI search engines.",
    whenToUse:
      "Use when answer coverage is low or simulated answers show intent gaps.",
    impactedDimensions: ["Answer Coverage", "Content Structure"],
    priority: "high",
    beforeExample: "[No FAQ section exists]",
    afterExample:
      "Q: What is GEO? A: Generative Engine Optimization (GEO) is the practice of optimizing content to be discovered, understood, and cited by AI-powered answer engines. Q: How is GEO different from SEO? A: SEO focuses on ranking in traditional search results, while GEO focuses on appearing in AI-generated answers.",
    implementationHint:
      "Add a FAQ section with 5-10 high-intent questions and concise answers using FAQPage schema.",
    applicableFailureTypes: [
      "intent_mismatch",
      "structure_gap",
      "missing_citable_facts",
    ],
    category: "content",
  },
  {
    id: "comparison-context",
    name: "Comparison Context",
    problem:
      "AI engines cannot place your brand in the competitive landscape, so they default to better-known alternatives.",
    whenToUse:
      "Use when competitors are mentioned in simulated answers but your brand is not.",
    impactedDimensions: ["Entity Clarity", "Answer Coverage"],
    priority: "high",
    beforeExample: "We offer the best GEO analysis tool.",
    afterExample:
      "Unlike Ahrefs and Semrush which focus on traditional SEO metrics, GEO Lens specifically measures AI answer engine visibility across five dimensions including citation readiness and entity clarity.",
    implementationHint:
      "Add objective comparison points with competitors, including specific dimensions where you differ.",
    applicableFailureTypes: [
      "weak_comparison_context",
      "entity_ambiguity",
      "missing_citable_facts",
    ],
    category: "comparison",
  },
  {
    id: "evidence-injection",
    name: "Evidence Injection",
    problem:
      "The content lacks the verifiable facts, numbers, dates, or third-party signals that AI engines use to justify citations.",
    whenToUse:
      "Use when citation readiness is low or content is flagged as too marketing-heavy.",
    impactedDimensions: ["Citation Readiness", "Freshness Signal"],
    priority: "medium",
    beforeExample: "Many teams use our product and love it.",
    afterExample:
      "As of May 2026, over 500 content teams have used GEO Lens, with an average GEO score improvement of 12 points within 30 days according to user-reported data.",
    implementationHint:
      "Add specific numbers, dates, release versions, case counts, or third-party references throughout the page.",
    applicableFailureTypes: [
      "missing_citable_facts",
      "over_marketing",
      "freshness_gap",
    ],
    category: "freshness",
  },
  {
    id: "audience-fit",
    name: "Audience Fit",
    problem:
      "AI engines don't know who the product is for, so they recommend it in the wrong context or not at all.",
    whenToUse:
      "Use when entity clarity is low or simulated answers mismatch the target audience.",
    impactedDimensions: ["Entity Clarity", "Answer Coverage"],
    priority: "medium",
    beforeExample: "GEO Lens is for everyone.",
    afterExample:
      "GEO Lens is designed for: (1) Content marketing teams who need to monitor AI search visibility, (2) Independent consultants and personal brands who want to be cited in AI answers, (3) Not ideal for large enterprises requiring multi-language AI monitoring across 100+ domains.",
    implementationHint:
      "Clearly state who the product is for and who it is NOT for.",
    applicableFailureTypes: [
      "entity_ambiguity",
      "intent_mismatch",
      "over_marketing",
    ],
    category: "content",
  },
  {
    id: "structured-data",
    name: "Structured Data",
    problem:
      "Search engines and AI crawlers cannot parse the page's key entities, products, or FAQ content.",
    whenToUse:
      "Use when content structure score is low or technical audit shows missing schema.",
    impactedDimensions: ["Content Structure", "Citation Readiness"],
    priority: "high",
    beforeExample: "[No JSON-LD schema on the page]",
    afterExample:
      'Add Organization schema with name, description, URL, sameAs links. Add FAQPage schema for FAQ sections. Add Product schema for core offerings.',
    implementationHint:
      "Add JSON-LD structured data for Organization, FAQPage, and Product types.",
    applicableFailureTypes: ["structure_gap", "entity_ambiguity"],
    category: "technical",
  },
  {
    id: "freshness-signal",
    name: "Freshness Signal",
    problem:
      "AI engines may deprioritize content that appears outdated, lacking dates, versions, or update indicators.",
    whenToUse:
      "Use when freshness signal score is low or content lacks temporal markers.",
    impactedDimensions: ["Freshness Signal", "Citation Readiness"],
    priority: "medium",
    beforeExample: "[No dates or version information on the page]",
    afterExample:
      "Last updated: May 2026. Current version: v2.1. Data refreshed weekly based on user-reported GEO score changes.",
    implementationHint:
      "Add last-updated dates, version numbers, release notes, or data freshness indicators.",
    applicableFailureTypes: ["freshness_gap"],
    category: "freshness",
  },
  {
    id: "llms-txt-hint",
    name: "LLMs.txt Hint",
    problem:
      "AI systems and LLM crawlers may not find a structured summary of what the project or site offers.",
    whenToUse:
      "Use when technical audit shows llms.txt is missing or content structure is low.",
    impactedDimensions: ["Content Structure", "Citation Readiness"],
    priority: "low",
    beforeExample: "[No llms.txt file]",
    afterExample:
      "# GEO Lens\n\nGEO Lens is a generative engine optimization analysis platform.\n\n## Key Pages\n- /projects: Create and manage GEO analysis projects\n- /strategies: Browse GEO optimization strategies\n\n## Tech Stack\nNext.js, Prisma, PostgreSQL, OpenAI-compatible API",
    implementationHint:
      "Add a /llms.txt file with a concise project summary and key page links.",
    applicableFailureTypes: ["structure_gap"],
    category: "technical",
  },
];

export function getStrategiesByDimension(dimension: string): StrategyItem[] {
  return STRATEGY_LIBRARY.filter((s) =>
    s.impactedDimensions.some(
      (d) => d.toLowerCase() === dimension.toLowerCase()
    )
  );
}

export function getStrategiesByFailureType(
  failureType: string
): StrategyItem[] {
  return STRATEGY_LIBRARY.filter((s) =>
    s.applicableFailureTypes.includes(failureType)
  );
}

export function getStrategyById(id: string): StrategyItem | undefined {
  return STRATEGY_LIBRARY.find((s) => s.id === id);
}

export function matchStrategies(
  failureTypes: string[],
  dimensions: string[]
): StrategyItem[] {
  const matched = new Set<StrategyItem>();

  for (const ft of failureTypes) {
    for (const s of getStrategiesByFailureType(ft)) {
      matched.add(s);
    }
  }

  for (const dim of dimensions) {
    for (const s of getStrategiesByDimension(dim)) {
      matched.add(s);
    }
  }

  return Array.from(matched).sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export const STRATEGY_CATEGORIES = [
  "content",
  "technical",
  "comparison",
  "freshness",
] as const;
