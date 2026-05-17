// Type imports from schemas are not needed at runtime —
// prompt builders accept plain objects with the needed fields.

export function buildGeoAnalysisPrompt(project: {
  name: string;
  brandName: string;
  description: string;
  audience: string;
  product: string;
  keywords: string[];
  competitors?: string[];
}): string {
  return `Analyze the following brand/project for Generative Engine Optimization (GEO) readiness.

Brand: ${project.brandName}
Description: ${project.description}
Target Audience: ${project.audience}
Product/Service: ${project.product}
Keywords: ${project.keywords.join(", ")}
${project.competitors?.length ? `Competitors: ${project.competitors.join(", ")}` : ""}

Evaluate the brand across five dimensions (each scored 0-100):
1. Entity Clarity: How clearly defined is the brand entity?
2. Answer Coverage: How well does the content answer questions users ask AI engines?
3. Citation Readiness: How likely is the content to be cited/quoted by AI?
4. Content Structure: How well structured is the content for AI extraction?
5. Freshness Signal: How fresh and current is the content?

Return a JSON object with:
- totalScore: overall score 0-100
- scores: object with the five dimension scores
- strengths: array of 3-5 strings
- weaknesses: array of 3-5 strings
- nextActions: array of 3-5 prioritized action items`;
}

export function buildQuestionsPrompt(project: {
  brandName: string;
  description: string;
  product: string;
  keywords: string[];
  competitors?: string[];
}): string {
  return `Generate 8 simulated questions that users might ask AI search engines about the following brand/category.

Brand: ${project.brandName}
Description: ${project.description}
Product: ${project.product}
Keywords: ${project.keywords.join(", ")}
${project.competitors?.length ? `Competitors: ${project.competitors.join(", ")}` : ""}

For each question, generate:
1. The user question
2. The intent type (one of: branded, non_branded_category, comparison, buyer_intent, problem_aware)
3. A realistic simulated AI answer (2-4 sentences)
4. Whether the brand "${project.brandName}" would be mentioned in this AI answer (true/false)
5. If mentioned, explain why. If not mentioned, explain what's missing.
6. A specific content improvement suggestion

Return JSON with a "questions" array.`;
}

export function buildRecommendationsPrompt(project: {
  brandName: string;
  description: string;
  audience: string;
  product: string;
  questions: Array<{
    question: string;
    brandMentioned: boolean;
    improvement: string;
  }>;
}): string {
  return `Based on the following GEO analysis for ${project.brandName}, generate 10 specific content optimization recommendations.

Brand: ${project.brandName}
Description: ${project.description}
Audience: ${project.audience}
Product: ${project.product}

Simulated AI questions and whether brand was mentioned:
${project.questions
  .map(
    (q) =>
      `Q: "${q.question}" -> Brand mentioned: ${q.brandMentioned}. Improvement: ${q.improvement}`
  )
  .join("\n")}

Generate recommendations covering these types:
- title: Homepage title optimization
- meta_description: Meta description
- faq: FAQ questions and answers
- structure: H2/H3 heading structure
- definition: Citable definition paragraph
- comparison: Comparison content
- schema: Structured data suggestions
- llms_txt: llms.txt draft
- content_gap: Missing content topics
- freshness: Freshness indicators

Return JSON with a "recommendations" array. Each item: type, title, content, priority (high/medium/low).`;
}

export function buildDiagnosticsPrompt(project: {
  brandName: string;
  description: string;
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
}): string {
  return `Diagnose why "${project.brandName}" might fail to be cited by AI answer engines.

Brand: ${project.brandName}
Description: ${project.description}

GEO Scores:
- Entity Clarity: ${project.scores.entityClarity}/100
- Answer Coverage: ${project.scores.answerCoverage}/100
- Citation Readiness: ${project.scores.citationReadiness}/100
- Content Structure: ${project.scores.contentStructure}/100
- Freshness Signal: ${project.scores.freshnessSignal}/100

Simulated Questions:
${project.questions
  .map(
    (q) =>
      `Q: "${q.question}" -> Brand mentioned: ${q.brandMentioned}\nAI Answer: ${q.simulatedAnswer}`
  )
  .join("\n\n")}

Identify 3-6 potential failure reasons. For each:
- failureType: one of entity_ambiguity, intent_mismatch, missing_citable_facts, weak_comparison_context, over_marketing, freshness_gap, structure_gap
- severity: high/medium/low
- evidence: specific evidence from the data
- reason: why this causes AI citation failure
- fix: specific actionable fix
- impactedDimension: which GEO dimension this affects
- relatedQuestion: which simulated question this relates to (optional)

Return JSON with a "failures" array.`;
}

export function buildDiffPrompt(originalContent: string, strategyName: string): string {
  return `Rewrite the following content to improve GEO (Generative Engine Optimization) readiness.

Strategy to apply: ${strategyName}

Original content:
"""
${originalContent}
"""

Optimize the content so it is:
1. More likely to be cited by AI answer engines
2. Contains a clear entity definition
3. Has citable facts and specific claims
4. Avoids vague marketing language
5. Is structured for easy AI extraction

Return JSON with:
- sourceLabel: label for this content piece
- beforeContent: the original content
- afterContent: the optimized content
- changeSummary: array of 3-5 specific changes made
- rationale: why these changes improve GEO
- impactedDimensions: array of affected GEO dimensions (Entity Clarity, Answer Coverage, Citation Readiness, Content Structure, Freshness Signal)
- addedElements: array of element types added (entity_definition, citable_summary, faq_hint, evidence, comparison, freshness_marker, schema_hint)`;
}

export function buildReadinessAuditPrompt(
  url: string | null,
  projectInfo: {
    brandName: string;
    description: string;
  }
): string {
  return `Perform a technical AI-readiness audit for the following website/brand.

${url ? `URL: ${url}` : "No URL provided - audit based on project information only."}
Brand: ${projectInfo.brandName}
Description: ${projectInfo.description}

Check the following items:
1. robots.txt: Is there a robots.txt file that might block AI crawlers?
2. sitemap.xml: Does the site have a sitemap.xml?
3. llms.txt: Is there an llms.txt file for AI crawlers?
4. meta_tags: Does the page have title, meta description, H1?
5. extractable_structure: Does the page have FAQ, definitions, lists, or tables?
6. jsonld_schema: Does the page have Organization, Product, or FAQPage JSON-LD?
7. server_rendered: Is content server-renderable (not fully client-side)?
8. ai_crawler_rules: Are there rules blocking AI-specific crawlers?

For each check, return: key, label, status (pass/warning/fail), impact description, fix suggestion, relatedStrategies (array of strategy IDs from: entity-definition, citable-summary, faq-expansion, structured-data, llms-txt-hint).

Return JSON with: totalScore (0-100), checks (array), summary (string).`;
}

export function buildPromptPortfolioPrompt(project: {
  brandName: string;
  description: string;
  audience: string;
  product: string;
  keywords: string[];
  competitors?: string[];
}): string {
  return `Generate a prompt portfolio for GEO monitoring of "${project.brandName}".

Brand: ${project.brandName}
Description: ${project.description}
Audience: ${project.audience}
Product: ${project.product}
Keywords: ${project.keywords.join(", ")}
${project.competitors?.length ? `Competitors: ${project.competitors.join(", ")}` : ""}

Generate 12 prompts across these intent types:
- branded: Brand-specific questions (e.g., "What is GEO Lens?")
- non_branded_category: Category questions without brand (e.g., "What are the best GEO tools?")
- comparison: Comparison questions (e.g., "GEO Lens vs CompetitorX")
- buyer_intent: Purchase intent questions (e.g., "How to choose a GEO tool?")
- problem_aware: Problem questions (e.g., "Why isn't my brand showing in AI search?")
- competitor: Competitor-specific questions

For each prompt:
- intentType: the intent category
- funnelStage: awareness/consideration/decision
- priority: high/medium/low
- targetKeyword: main keyword targeted
- expectedBrands: array of brands expected to appear
- demandScore: 0-100 estimated demand score

Return JSON with a "prompts" array.`;
}

export function buildSourceMapPrompt(project: {
  brandName: string;
  websiteUrl?: string;
  description: string;
  competitors?: string[];
}): string {
  return `Analyze the citation source landscape for "${project.brandName}".

Brand: ${project.brandName}
${project.websiteUrl ? `Website: ${project.websiteUrl}` : ""}
Description: ${project.description}
${project.competitors?.length ? `Competitors: ${project.competitors.join(", ")}` : ""}

For each source category below, assess the brand's current coverage:
- owned_site: Official website, blog, docs
- docs: Product documentation, help center
- third_party_articles: Third-party articles, media coverage
- reviews: Review sites, directories, listings
- community: Reddit, forums, community discussions
- video: YouTube, podcasts, video content
- comparison_pages: Competitor comparison pages
- social_profiles: LinkedIn, X/Twitter, GitHub profiles

For each category, return:
- category: the source category
- coverage: strong/partial/missing
- influence: how this category influences AI citations
- gap: what's missing
- recommendedStrategies: array of strategy IDs

Return JSON with a "sources" array.`;
}

export const LLM_SYSTEM_PROMPT =
  "You are a GEO (Generative Engine Optimization) expert. Always respond with valid JSON exactly matching the requested schema. Do not include markdown formatting, code fences, or explanations outside the JSON.";
