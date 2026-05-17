import type {
  GeoAnalysis,
  SimulatedQuestion,
  CitationFailure as CF,
  ContentDiff,
  ReadinessAuditResult,
  PromptPortfolioItem,
  CitationSourceItem,
} from "@/lib/llm/schemas";

export const MOCK_GEO_ANALYSIS: GeoAnalysis = {
  totalScore: 62,
  scores: {
    entityClarity: 55,
    answerCoverage: 68,
    citationReadiness: 48,
    contentStructure: 72,
    freshnessSignal: 67,
  },
  strengths: [
    "Clear product description with target audience identified",
    "Well-structured documentation pages",
    "Active blog with regular content updates",
  ],
  weaknesses: [
    "Brand entity definition is vague - AI engines struggle to categorize",
    "Missing citable facts, statistics, and verifiable proof points",
    "Homepage lacks comparison context against known competitors",
    "No structured data (JSON-LD) for Organization or Product",
    "Limited FAQ content covering high-intent user questions",
  ],
  nextActions: [
    "Add a clear one-sentence entity definition to the homepage",
    "Create a FAQ section with 8-10 high-intent questions and concise answers",
    "Add JSON-LD Organization and FAQPage schema",
    "Inject 3-5 citable facts with numbers and dates",
    "Add comparison context mentioning 2-3 known competitors",
  ],
};

export const MOCK_QUESTIONS: SimulatedQuestion[] = [
  {
    question: "What is the best GEO analysis tool for small content teams?",
    intent: "non_branded_category",
    simulatedAnswer:
      "For small content teams looking for GEO analysis, popular options include Profound for brand monitoring, Peec for AI answer tracking, and various SEO tools that are adding GEO features. The key is finding a tool that matches your team size and budget.",
    brandMentioned: false,
    mentionReason:
      "Brand lacks clear category positioning and citable proof points that would make AI engines include it in recommendations.",
    improvement:
      "Add a clear product positioning statement: 'GEO Lens is a generative engine optimization tool designed for small content teams that need to monitor and improve their AI search visibility.'",
  },
  {
    question: "How can I check if my brand appears in AI search results?",
    intent: "problem_aware",
    simulatedAnswer:
      "To check if your brand appears in AI search results, you can manually test queries in ChatGPT, Perplexity, and Google AI Overviews. You can also use specialized GEO tools that automate this monitoring and provide visibility scores.",
    brandMentioned: false,
    mentionReason:
      "The answer is generic because no specific tool has strong enough entity clarity and citation signals.",
    improvement:
      "Add content about specific AI answer engine testing methodology, including example queries and expected outcomes.",
  },
  {
    question: "GEO Lens vs traditional SEO tools - what's the difference?",
    intent: "comparison",
    simulatedAnswer:
      "Traditional SEO tools like Ahrefs and Semrush focus on keyword rankings, backlinks, and organic traffic from traditional search engines. GEO-specific tools like GEO Lens, Profound, and Peec instead measure how well content performs in AI-generated answers, looking at factors like citation readiness, entity clarity, and answer coverage.",
    brandMentioned: true,
    mentionReason:
      "The brand name 'GEO Lens' is specific enough to be recognized as a GEO tool category player when explicitly searched.",
    improvement:
      "Strengthen the comparison by adding specific feature differences and use case examples unique to GEO Lens.",
  },
  {
    question: "Why isn't my brand showing up in ChatGPT's answers?",
    intent: "problem_aware",
    simulatedAnswer:
      "Brands may not appear in ChatGPT answers for several reasons: the AI model may not have been trained on your content, your entity definition may be unclear, you may lack citable facts and structured data, or competing brands may have stronger citation signals. To fix this, you need to improve your entity clarity, add citable content, and implement structured data.",
    brandMentioned: false,
    mentionReason:
      "No specific brand is mentioned because this is a general diagnostic question - an opportunity to be cited as the solution.",
    improvement:
      "Create diagnostic content that helps users self-identify their GEO issues, positioning GEO Lens as the solution with specific tool features.",
  },
  {
    question: "What metrics should I track for generative engine optimization?",
    intent: "buyer_intent",
    simulatedAnswer:
      "Key GEO metrics to track include: entity clarity score, citation frequency in AI answers, answer coverage across query types, content structure quality, freshness signals, and competitor citation rates. Some GEO platforms provide dashboards that aggregate these metrics into an overall visibility score.",
    brandMentioned: false,
    mentionReason:
      "The answer covers metrics generally but doesn't reference any specific tool's scoring model.",
    improvement:
      "Publish content about GEO Lens's five-dimension scoring model (Entity Clarity, Answer Coverage, Citation Readiness, Content Structure, Freshness Signal) as an industry framework.",
  },
  {
    question: "How do I optimize my content for Google AI Overviews?",
    intent: "non_branded_category",
    simulatedAnswer:
      "To optimize for Google AI Overviews, focus on: clear entity definitions, FAQ content with concise answers, structured data markup (Organization, FAQPage), well-organized H2/H3 headings, and content that directly answers common user questions in 2-3 sentence summaries.",
    brandMentioned: false,
    mentionReason:
      "Generic optimization advice with no tool-specific recommendation - an opportunity lost.",
    improvement:
      "Create a dedicated 'AI Overview Optimization Guide' page that demonstrates expertise and can be cited as an authoritative source.",
  },
];

export const MOCK_RECOMMENDATIONS = [
  {
    type: "title",
    title: "Optimize Homepage Title Tag",
    content:
      'Current: "GEO Lens - Home"\n\nOptimized: "GEO Lens | Generative Engine Optimization Platform for Content Teams"',
    priority: "high" as const,
  },
  {
    type: "meta_description",
    title: "Improve Meta Description",
    content:
      "GEO Lens helps content teams and personal brands measure and improve their visibility in AI-powered search engines. Get a GEO score, find citation gaps, and generate optimized content that AI engines can discover, summarize, and cite.",
    priority: "high" as const,
  },
  {
    type: "definition",
    title: "Add Citable Entity Definition",
    content:
      "GEO Lens is a generative engine optimization (GEO) analysis platform designed for content marketing teams, independent consultants, and personal brands. It evaluates whether your brand can be discovered, summarized, and cited by AI answer engines like ChatGPT, Perplexity, and Google AI Overviews.",
    priority: "high" as const,
  },
  {
    type: "faq",
    title: "Add FAQ Section",
    content:
      "Q: What is Generative Engine Optimization (GEO)?\nA: GEO is the practice of optimizing content to be discovered, understood, and cited by AI-powered answer engines rather than just ranking in traditional search results.\n\nQ: How is GEO different from SEO?\nA: While SEO focuses on keyword rankings and organic traffic from search engines like Google, GEO focuses on whether AI answer engines cite your brand when users ask questions in natural language.\n\nQ: What does a GEO score measure?\nA: GEO Lens measures five dimensions: Entity Clarity, Answer Coverage, Citation Readiness, Content Structure, and Freshness Signal.",
    priority: "high" as const,
  },
  {
    type: "comparison",
    title: "Add Competitor Comparison Context",
    content:
      "Unlike traditional SEO tools (Ahrefs, Semrush) that measure keyword rankings and backlinks, or social listening tools (Brandwatch) that track mentions, GEO Lens specifically evaluates AI answer engine visibility. While Profound and Peec focus on enterprise brand monitoring, GEO Lens is designed for small to medium content teams that need actionable GEO insights.",
    priority: "medium" as const,
  },
  {
    type: "structure",
    title: "Improve Page Heading Structure",
    content:
      "Recommended H2/H3 structure for homepage:\n\nH2: How GEO Lens Works\nH3: 1. Create Your Project\nH3: 2. Run GEO Analysis\nH3: 3. Review AI Answer Simulation\nH3: 4. Get Optimization Recommendations\n\nH2: What Makes GEO Lens Different\nH3: Five-Dimension GEO Scoring\nH3: Citation Failure Diagnosis\nH3: Strategy Library\n\nH2: Frequently Asked Questions\n[FAQ items]",
    priority: "medium" as const,
  },
  {
    type: "schema",
    title: "Add JSON-LD Structured Data",
    content:
      "Add to homepage <head>:\n\nOrganization schema: name, description, url, logo, sameAs (GitHub, LinkedIn, Twitter)\n\nFAQPage schema: wrap FAQ section with FAQPage markup\n\nProduct schema: name, description, category (GEO tools), offers",
    priority: "high" as const,
  },
  {
    type: "freshness",
    title: "Add Freshness Signals",
    content:
      "Add to homepage footer or about section:\n- Last updated: [current date]\n- Current version: v1.0\n- Data methodology: GEO scores are based on analysis of AI answer engine behavior patterns\n- Update frequency: Platform updated [weekly/monthly]",
    priority: "medium" as const,
  },
  {
    type: "llms_txt",
    title: "Create llms.txt File",
    content:
      "# GEO Lens\n\nGEO Lens is a generative engine optimization analysis platform.\n\n## Project Info\n- Tech Stack: Next.js, TypeScript, Prisma, PostgreSQL, OpenAI-compatible API\n- Deployment: Vercel + Neon, or Docker Compose + VPS\n- Open Source: MIT License\n\n## Key Pages\n- /projects: Create and manage GEO analysis projects\n- /strategies: Browse GEO optimization strategies\n\n## API\n- /api/health: Health check endpoint",
    priority: "low" as const,
  },
  {
    type: "content_gap",
    title: "Add Missing Content Topics",
    content:
      "Content gaps identified:\n1. No case study or example of GEO improvement\n2. No methodology page explaining how GEO scoring works\n3. No glossary defining GEO terms\n4. No integration or API documentation\n5. No comparison page listing GEO tools",
    priority: "medium" as const,
  },
];

export const MOCK_DIAGNOSTICS: CF[] = [
  {
    failureType: "entity_ambiguity",
    severity: "high",
    evidence:
      "When asked 'What is the best GEO analysis tool?', the simulated AI answer did not mention the brand. The brand description is too generic to be recognized as a distinct entity by AI engines.",
    reason:
      "AI answer engines need a clear, concise entity definition to recognize a brand as a relevant recommendation. Vague descriptions fail to establish category membership.",
    fix: "Add a one-sentence entity definition: 'GEO Lens is a generative engine optimization platform for content teams that measures AI answer engine visibility across five dimensions.'",
    impactedDimension: "Entity Clarity",
    relatedQuestion: "What is the best GEO analysis tool for small content teams?",
  },
  {
    failureType: "missing_citable_facts",
    severity: "high",
    evidence:
      "AI simulated answers consistently use generic descriptions instead of citing specific features, numbers, or proof points about the brand. No statistics, dates, or verifiable claims are available for AI to quote.",
    reason:
      "AI engines prefer to cite content with specific, verifiable facts rather than vague marketing claims. Without numbers, dates, or proof points, the brand is not quotable.",
    fix: "Add 3-5 citable facts: number of dimensions scored, types of analysis supported, specific AI engines covered, methodology description, and user statistics.",
    impactedDimension: "Citation Readiness",
    relatedQuestion: "How can I check if my brand appears in AI search results?",
  },
  {
    failureType: "weak_comparison_context",
    severity: "medium",
    evidence:
      "The brand is mentioned when explicitly searched ('GEO Lens vs traditional SEO tools') but not when users search for general GEO tool recommendations. Competitors with stronger comparison context dominate general queries.",
    reason:
      "When users search for category recommendations, AI engines look for brands that have established clear differentiation points against known alternatives.",
    fix: "Add comparison content that objectively differentiates GEO Lens from Ahrefs, Semrush, Profound, and Peec on specific dimensions (pricing, team size focus, analysis depth).",
    impactedDimension: "Entity Clarity",
    relatedQuestion: "GEO Lens vs traditional SEO tools - what's the difference?",
  },
  {
    failureType: "structure_gap",
    severity: "medium",
    evidence:
      "The content lacks FAQ sections, structured data, tables, and lists that AI engines can easily parse and extract. Current content is primarily narrative paragraphs.",
    reason:
      "AI engines extract information more reliably from well-structured content (FAQs, tables, lists) than from narrative text. Missing structure makes extraction unreliable.",
    fix: "Add FAQPage schema, Organization schema, and restructure key content into FAQ format with clear question-answer pairs.",
    impactedDimension: "Content Structure",
  },
  {
    failureType: "intent_mismatch",
    severity: "medium",
    evidence:
      "The content focuses on describing what the product does, but doesn't answer the questions users actually ask AI engines ('how to check AI visibility', 'why am I not showing up', 'what metrics matter').",
    reason:
      "Content optimized for traditional SEO often targets keyword phrases, but GEO requires matching the natural language questions users ask AI assistants.",
    fix: "Create content that directly answers specific user questions identified in the AI answer simulation, particularly problem-aware and buyer-intent queries.",
    impactedDimension: "Answer Coverage",
    relatedQuestion: "What metrics should I track for generative engine optimization?",
  },
];

export const MOCK_DIFF: ContentDiff = {
  sourceLabel: "Homepage Summary",
  beforeContent:
    "We help teams improve their AI visibility. Our tool provides GEO analysis and recommendations for better content performance in AI search engines.",
  afterContent:
    "GEO Lens is a generative engine optimization (GEO) analysis platform designed for small to medium content teams (2-50 people). As of May 2026, it evaluates brand visibility across five dimensions — Entity Clarity, Answer Coverage, Citation Readiness, Content Structure, and Freshness Signal — to help teams understand why they are or aren't being cited by AI answer engines like ChatGPT, Perplexity, and Google AI Overviews. Unlike traditional SEO tools that focus on keyword rankings, GEO Lens specifically measures AI citation potential and generates actionable content optimization recommendations.",
  changeSummary: [
    "Added a one-sentence entity definition with category and audience",
    "Added citable facts: five dimensions, target team size, AI engines covered",
    "Replaced vague marketing language ('improve AI visibility') with specific capability claims",
    "Added comparison context against traditional SEO tools",
    "Included freshness marker (May 2026)",
  ],
  rationale:
    "The optimized version is easier for AI engines to quote because it contains a clear entity definition, specific facts (5 dimensions, 2-50 people), comparison context, and temporal markers. AI engines can extract and cite any of these elements individually or in combination.",
  impactedDimensions: ["Entity Clarity", "Citation Readiness", "Answer Coverage", "Freshness Signal"],
  addedElements: ["entity_definition", "citable_summary", "evidence", "comparison", "freshness_marker"],
};

export const MOCK_READINESS_AUDIT: ReadinessAuditResult = {
  totalScore: 58,
  checks: [
    {
      key: "robots_txt",
      label: "robots.txt",
      status: "warning",
      impact: "No robots.txt found at the expected URL. AI crawlers lack guidance on which pages to crawl or avoid.",
      fix: "Add a robots.txt file that allows legitimate AI crawlers while protecting sensitive paths.",
      relatedStrategies: ["llms-txt-hint"],
    },
    {
      key: "sitemap_xml",
      label: "sitemap.xml",
      status: "warning",
      impact: "No sitemap.xml found. AI and traditional crawlers may miss important pages.",
      fix: "Add a sitemap.xml listing all key pages with lastmod dates and priority hints.",
      relatedStrategies: [],
    },
    {
      key: "llms_txt",
      label: "llms.txt",
      status: "fail",
      impact: "No llms.txt file. AI answer engines lack a structured overview of the site's purpose, key pages, and documentation.",
      fix: "Create /llms.txt with project summary, key pages, documentation links, and tech stack information.",
      relatedStrategies: ["llms-txt-hint", "citable-summary"],
    },
    {
      key: "meta_tags",
      label: "Meta Tags",
      status: "warning",
      impact: "Meta title and description are present but generic. They don't clearly communicate the brand entity or value proposition to AI crawlers.",
      fix: "Optimize title tag to include brand name and category. Update meta description with a clear value proposition and key capabilities.",
      relatedStrategies: ["entity-definition"],
    },
    {
      key: "extractable_structure",
      label: "Extractable Structure",
      status: "warning",
      impact: "Page content is primarily narrative text without clear FAQ sections, definition blocks, or structured lists that AI can reliably extract.",
      fix: "Add FAQ sections, definition paragraphs with clear labels, and structured lists. Use H2/H3 headings that form a logical outline.",
      relatedStrategies: ["faq-expansion", "citable-summary"],
    },
    {
      key: "jsonld_schema",
      label: "JSON-LD Schema",
      status: "fail",
      impact: "No JSON-LD structured data found. Search engines and AI crawlers cannot programmatically identify the organization, products, or FAQ content.",
      fix: "Add Organization schema with name, description, URL, logo, and sameAs links. Add FAQPage schema wrapping FAQ content.",
      relatedStrategies: ["structured-data"],
    },
    {
      key: "server_rendered",
      label: "Server-Rendered Content",
      status: "pass",
      impact: "Next.js App Router provides server-side rendering. Key content is available in the initial HTML response.",
      fix: "Maintain SSR for key content pages. Avoid fully client-rendered critical content.",
      relatedStrategies: [],
    },
    {
      key: "ai_crawler_rules",
      label: "AI Crawler Rules",
      status: "warning",
      impact: "Without explicit robots.txt rules, AI crawlers (GPTBot, Claude-Web, PerplexityBot, Google-Extended) may or may not access content.",
      fix: "Add specific rules in robots.txt for major AI crawlers. Consider allowing them to access public content while protecting admin areas.",
      relatedStrategies: ["llms-txt-hint"],
    },
  ],
  summary: "The site has a solid foundation with server-rendered content but lacks critical AI-readiness elements including structured data, AI-specific crawler guidance, and extractable content structures.",
};

export const MOCK_PROMPT_PORTFOLIO: PromptPortfolioItem[] = [
  {
    prompt: "What is GEO Lens?",
    intentType: "branded",
    funnelStage: "awareness",
    priority: "high",
    targetKeyword: "GEO Lens",
    expectedBrands: ["GEO Lens"],
    demandScore: 65,
  },
  {
    prompt: "GEO Lens review and features",
    intentType: "branded",
    funnelStage: "consideration",
    priority: "high",
    targetKeyword: "GEO Lens review",
    expectedBrands: ["GEO Lens"],
    demandScore: 45,
  },
  {
    prompt: "What are the best GEO analysis tools?",
    intentType: "non_branded_category",
    funnelStage: "consideration",
    priority: "high",
    targetKeyword: "GEO analysis tools",
    expectedBrands: ["GEO Lens", "Profound", "Peec"],
    demandScore: 82,
  },
  {
    prompt: "Generative engine optimization platforms for small teams",
    intentType: "non_branded_category",
    funnelStage: "consideration",
    priority: "medium",
    targetKeyword: "GEO platforms small team",
    expectedBrands: ["GEO Lens"],
    demandScore: 55,
  },
  {
    prompt: "GEO Lens vs Ahrefs vs Semrush for AI search visibility",
    intentType: "comparison",
    funnelStage: "decision",
    priority: "high",
    targetKeyword: "GEO Lens vs Ahrefs",
    expectedBrands: ["GEO Lens", "Ahrefs", "Semrush"],
    demandScore: 38,
  },
  {
    prompt: "Which GEO tool is best for content marketing teams?",
    intentType: "comparison",
    funnelStage: "decision",
    priority: "medium",
    targetKeyword: "best GEO tool content marketing",
    expectedBrands: ["GEO Lens", "Profound"],
    demandScore: 48,
  },
  {
    prompt: "How to choose a GEO service provider?",
    intentType: "buyer_intent",
    funnelStage: "decision",
    priority: "medium",
    targetKeyword: "choose GEO service",
    expectedBrands: ["GEO Lens"],
    demandScore: 42,
  },
  {
    prompt: "Affordable GEO analysis for personal brands",
    intentType: "buyer_intent",
    funnelStage: "decision",
    priority: "medium",
    targetKeyword: "affordable GEO analysis",
    expectedBrands: ["GEO Lens"],
    demandScore: 35,
  },
  {
    prompt: "Why isn't my brand showing up in AI search results?",
    intentType: "problem_aware",
    funnelStage: "awareness",
    priority: "high",
    targetKeyword: "brand not in AI search",
    expectedBrands: ["GEO Lens"],
    demandScore: 75,
  },
  {
    prompt: "How to increase AI answer engine citations?",
    intentType: "problem_aware",
    funnelStage: "consideration",
    priority: "high",
    targetKeyword: "increase AI citations",
    expectedBrands: ["GEO Lens"],
    demandScore: 68,
  },
  {
    prompt: "Profound vs Peec for GEO monitoring",
    intentType: "competitor",
    funnelStage: "consideration",
    priority: "low",
    targetKeyword: "Profound vs Peec",
    expectedBrands: ["Profound", "Peec"],
    demandScore: 28,
  },
  {
    prompt: "What is generative engine optimization?",
    intentType: "non_branded_category",
    funnelStage: "awareness",
    priority: "medium",
    targetKeyword: "generative engine optimization",
    expectedBrands: ["GEO Lens"],
    demandScore: 70,
  },
];

export const MOCK_SOURCE_MAP: CitationSourceItem[] = [
  {
    category: "owned_site",
    coverage: "partial",
    influence: "The official site is the primary source for AI engines to understand the brand entity, product scope, and unique value proposition. A clear, well-structured site with entity definitions and citable content significantly increases citation probability.",
    gap: "Homepage lacks concise entity definition and citable product summary. No dedicated FAQ or comparison pages.",
    recommendedStrategies: ["entity-definition", "faq-expansion", "citable-summary"],
  },
  {
    category: "docs",
    coverage: "missing",
    influence: "Product documentation and help centers provide detailed, factual content that AI engines trust for answering specific how-to and technical questions.",
    gap: "No public documentation site, help center, or knowledge base available for AI crawlers to reference.",
    recommendedStrategies: ["citable-summary", "evidence-injection"],
  },
  {
    category: "third_party_articles",
    coverage: "missing",
    influence: "Third-party articles, media coverage, and industry publications provide external validation that AI engines use to assess credibility and relevance.",
    gap: "No known third-party articles, press mentions, or industry coverage referencing the brand.",
    recommendedStrategies: ["comparison-context", "evidence-injection"],
  },
  {
    category: "reviews",
    coverage: "missing",
    influence: "Review sites, directories, and comparison platforms are frequently cited by AI engines when users ask for recommendations or comparisons.",
    gap: "No presence on major review platforms, software directories, or comparison sites (G2, Product Hunt, Capterra, etc.).",
    recommendedStrategies: ["comparison-context", "evidence-injection"],
  },
  {
    category: "community",
    coverage: "missing",
    influence: "Community discussions on Reddit, forums, and Stack Overflow often surface in AI answers for problem-aware and recommendation queries.",
    gap: "No visible community discussions, Reddit mentions, or forum threads about the brand or its category.",
    recommendedStrategies: ["audience-fit", "citable-summary"],
  },
  {
    category: "video",
    coverage: "missing",
    influence: "YouTube videos and podcasts are increasingly referenced by AI engines, especially for tutorial, review, and comparison content.",
    gap: "No video content, tutorials, or podcast appearances that AI engines could reference.",
    recommendedStrategies: ["evidence-injection", "citable-summary"],
  },
  {
    category: "comparison_pages",
    coverage: "missing",
    influence: "Comparison pages ('X vs Y', 'X alternatives') are heavily cited by AI engines for competitor comparison and decision-support queries.",
    gap: "No comparison pages or alternative-to pages that position the brand against known competitors.",
    recommendedStrategies: ["comparison-context"],
  },
  {
    category: "social_profiles",
    coverage: "partial",
    influence: "LinkedIn, X/Twitter, and GitHub profiles provide entity signals and fresh content that AI engines use to verify brand activity and relevance.",
    gap: "Brand may have social profiles but they are not optimized for AI discovery or linked to the main site via sameAs schema.",
    recommendedStrategies: ["structured-data", "freshness-signal"],
  },
];
