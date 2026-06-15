import { parseJsonField } from "@/lib/utils";

export type ModelVisibilityStatus = "strong" | "partial" | "missing";

export interface ModelVisibilityCheck {
  id: string;
  provider: string;
  model: string;
  queryFocus: string;
  knowsBrand: boolean;
  recommendsBrand: boolean;
  citesBrand: boolean;
  visibilityScore: number;
  citationStatus: ModelVisibilityStatus;
  answerPreview: string;
  citationPreview: string[];
  evidence: string[];
  blockers: string[];
  nextStep: string;
}

export interface ModelVisibilityDemo {
  resultSource: "demo";
  project: {
    id: string;
    brandName: string;
    websiteUrl: string | null;
  };
  summary: {
    modelsChecked: number;
    knownBy: number;
    recommendedBy: number;
    citedBy: number;
    averageScore: number;
    strongestModel: string;
    weakestModel: string;
  };
  querySet: string[];
  models: ModelVisibilityCheck[];
}

interface ProjectLike {
  id: string;
  brandName: string;
  websiteUrl: string | null;
  description: string;
  product: string;
  keywords: string;
  competitors: string | null;
}

const MODEL_FIXTURES = [
  {
    id: "chatgpt-search",
    provider: "OpenAI",
    model: "ChatGPT Search",
    baseScore: 72,
    queryFocus: "category recommendation",
  },
  {
    id: "perplexity-sonar",
    provider: "Perplexity",
    model: "Perplexity Sonar",
    baseScore: 76,
    queryFocus: "source-backed answer",
  },
  {
    id: "gemini-grounded",
    provider: "Google",
    model: "Gemini Grounded",
    baseScore: 61,
    queryFocus: "comparison answer",
  },
  {
    id: "claude-web",
    provider: "Anthropic",
    model: "Claude Web",
    baseScore: 55,
    queryFocus: "problem-aware assistant answer",
  },
  {
    id: "ai-overviews",
    provider: "Google",
    model: "AI Overviews",
    baseScore: 47,
    queryFocus: "search result synthesis",
  },
];

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function statusFromScore(score: number): ModelVisibilityStatus {
  if (score >= 70) return "strong";
  if (score >= 52) return "partial";
  return "missing";
}

function buildAnswerPreview(
  brandName: string,
  product: string,
  primaryKeyword: string,
  competitor: string,
  check: {
    provider: string;
    queryFocus: string;
  },
  knowsBrand: boolean,
  recommendsBrand: boolean
): string {
  if (!knowsBrand) {
    return `${check.provider} returns generic advice for ${primaryKeyword || "AI visibility"} and names better-known alternatives before discovering ${brandName}.`;
  }

  if (recommendsBrand) {
    return `${brandName} appears as a relevant ${product || "GEO analysis"} option for teams evaluating ${primaryKeyword || "AI search visibility"}, usually alongside ${competitor}.`;
  }

  return `${brandName} is recognized when the query includes the brand or a close category phrase, but it is not promoted as a default recommendation yet.`;
}

export function buildModelVisibilityDemo(project: ProjectLike): ModelVisibilityDemo {
  const keywords = parseJsonField<string[]>(project.keywords, []);
  const competitors = parseJsonField<string[]>(project.competitors, []);
  const primaryKeyword = keywords[0] || "generative engine optimization";
  const competitor = competitors[0] || "Profound";
  const hasWebsite = Boolean(project.websiteUrl);
  const hasSpecificDescription = project.description.length > 180;
  const hasCompetitors = competitors.length > 0;

  const models = MODEL_FIXTURES.map((fixture, index) => {
    const score = clampScore(
      fixture.baseScore +
        (hasWebsite ? 4 : -3) +
        (hasSpecificDescription ? 5 : -4) +
        (hasCompetitors ? 3 : -2) -
        index
    );
    const citationStatus = statusFromScore(score);
    const knowsBrand = score >= 50;
    const recommendsBrand = score >= 64;
    const citesBrand = score >= 72;

    return {
      id: fixture.id,
      provider: fixture.provider,
      model: fixture.model,
      queryFocus: fixture.queryFocus,
      knowsBrand,
      recommendsBrand,
      citesBrand,
      visibilityScore: score,
      citationStatus,
      answerPreview: buildAnswerPreview(
        project.brandName,
        project.product,
        primaryKeyword,
        competitor,
        fixture,
        knowsBrand,
        recommendsBrand
      ),
      citationPreview: citesBrand
        ? [
            `${project.brandName} homepage entity definition`,
            "llms.txt project summary",
            "README product and deployment overview",
          ]
        : citationStatus === "partial"
          ? [`${project.brandName} brand mention`, "category-level GEO explanation"]
          : [],
      evidence: [
        knowsBrand
          ? "Brand entity is discoverable in demo prompts"
          : "Brand entity is weak for broad category prompts",
        recommendsBrand
          ? "Model includes the brand in a short-list answer"
          : "Model requires branded or comparison phrasing",
        citesBrand
          ? "Answer includes source-like references"
          : "Answer lacks a concrete citation target",
      ],
      blockers:
        citationStatus === "strong"
          ? ["Keep comparison and proof-point pages fresh"]
          : [
              "Add citable facts with dates, numbers, and methodology",
              `Publish comparison content against ${competitor}`,
            ],
      nextStep:
        citationStatus === "strong"
          ? "Turn the strongest prompt into a monitoring query for weekly checks."
          : "Add a concise entity definition, FAQ answers, and source-backed proof points.",
    } satisfies ModelVisibilityCheck;
  });

  const totalScore = models.reduce((sum, model) => sum + model.visibilityScore, 0);
  const strongest = [...models].sort((a, b) => b.visibilityScore - a.visibilityScore)[0];
  const weakest = [...models].sort((a, b) => a.visibilityScore - b.visibilityScore)[0];

  return {
    resultSource: "demo",
    project: {
      id: project.id,
      brandName: project.brandName,
      websiteUrl: project.websiteUrl,
    },
    summary: {
      modelsChecked: models.length,
      knownBy: models.filter((model) => model.knowsBrand).length,
      recommendedBy: models.filter((model) => model.recommendsBrand).length,
      citedBy: models.filter((model) => model.citesBrand).length,
      averageScore: Math.round(totalScore / models.length),
      strongestModel: strongest.model,
      weakestModel: weakest.model,
    },
    querySet: [
      `What are the best ${primaryKeyword} tools?`,
      `How can I check whether ${project.brandName} appears in AI answers?`,
      `${project.brandName} vs ${competitor}`,
    ],
    models,
  };
}
