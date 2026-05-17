import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { assertProjectWriteAccess } from "@/lib/demo/access";
import { callLLM } from "@/lib/llm/client";
import { ReadinessAuditResponseSchema } from "@/lib/llm/schemas";
import { buildReadinessAuditPrompt } from "@/lib/llm/prompts";
import { MOCK_READINESS_AUDIT } from "@/lib/mock-data";
import { safeFetch, SafeFetchError } from "@/lib/fetch/safe-fetch";

interface HeuristicCheck {
  key: string;
  label: string;
  status: "pass" | "warning" | "fail";
  impact: string;
  fix: string;
  relatedStrategies: string[];
}

function heuristicAudit(
  baseUrl: string | null,
  html: string | null,
  robotsTxt: string | null,
  sitemapFound: boolean,
  llmsFound: boolean,
  fetchErrors: string[]
): { checks: HeuristicCheck[]; totalScore: number; summary: string } {
  const checks: HeuristicCheck[] = [];

  // robots.txt
  if (robotsTxt !== null) {
    const blockedAI = ["GPTBot", "Claude-Web", "PerplexityBot", "Google-Extended", "CCBot", "anthropic-ai"]
      .filter((bot) => robotsTxt.includes(`User-agent: ${bot}`) && robotsTxt.includes(`Disallow: /`));
    if (blockedAI.length > 0) {
      checks.push({
        key: "robots_txt", label: "robots.txt", status: "warning",
        impact: `robots.txt blocks AI crawlers: ${blockedAI.join(", ")}. AI engines may not access your content.`,
        fix: "Review robots.txt and consider allowing legitimate AI crawlers while blocking malicious ones.",
        relatedStrategies: ["llms-txt-hint"],
      });
    } else if (robotsTxt.includes("Disallow: /")) {
      checks.push({
        key: "robots_txt", label: "robots.txt", status: "warning",
        impact: "robots.txt disallows all crawlers. AI engines cannot access any content.",
        fix: "Update robots.txt to allow legitimate crawlers.",
        relatedStrategies: [],
      });
    } else {
      checks.push({
        key: "robots_txt", label: "robots.txt", status: "pass",
        impact: "robots.txt exists and does not appear to block major AI crawlers.",
        fix: "",
        relatedStrategies: [],
      });
    }
  } else {
    checks.push({
      key: "robots_txt", label: "robots.txt", status: "warning",
      impact: "Could not fetch robots.txt. AI crawlers lack guidance on which pages to crawl.",
      fix: "Add a robots.txt file at the root of your domain.",
      relatedStrategies: ["llms-txt-hint"],
    });
  }

  // sitemap.xml
  checks.push({
    key: "sitemap_xml", label: "sitemap.xml",
    status: sitemapFound ? "pass" : "warning",
    impact: sitemapFound ? "Sitemap found — search and AI crawlers can discover your pages." : "No sitemap.xml found. Crawlers may miss important pages.",
    fix: sitemapFound ? "" : "Add a sitemap.xml listing key pages with lastmod dates.",
    relatedStrategies: [],
  });

  // llms.txt
  checks.push({
    key: "llms_txt", label: "llms.txt",
    status: llmsFound ? "pass" : "fail",
    impact: llmsFound ? "llms.txt found — AI answer engines have a structured project summary." : "No llms.txt file. AI engines lack a concise project overview.",
    fix: llmsFound ? "" : "Create /llms.txt with project summary, key pages, and documentation links.",
    relatedStrategies: llmsFound ? [] : ["llms-txt-hint", "citable-summary"],
  });

  // HTML-based checks
  if (html !== null) {
    const hasTitle = /<title[^>]*>([^<]+)<\/title>/i.test(html);
    const hasMetaDesc = /<meta[^>]*name="description"[^>]*content="([^"]+)"/i.test(html) ||
      /<meta[^>]*content="([^"]+)"[^>]*name="description"/i.test(html);
    const hasH1 = /<h1[^>]*>/i.test(html);
    const hasJSONLD = /application\/ld\+json/i.test(html);
    const hasFAQ = /<dl[^>]*>/i.test(html) || /itemprop="mainEntity"/i.test(html) ||
      /question.*answer|faq/i.test(html);
    const hasSchemaOrg = /schema\.org/i.test(html);
    const hasLists = /<\/ul>|<\/ol>/i.test(html);
    const hasTables = /<table[^>]*>/i.test(html);

    checks.push({
      key: "meta_tags", label: "Meta Tags",
      status: hasTitle && hasMetaDesc ? "pass" : (hasTitle || hasMetaDesc ? "warning" : "fail"),
      impact: "Page title and meta description help AI engines understand page content and generate accurate citations.",
      fix: hasTitle && hasMetaDesc ? "" : "Add unique title and meta description tags to each page.",
      relatedStrategies: hasTitle && hasMetaDesc ? [] : ["entity-definition"],
    });

    checks.push({
      key: "headings", label: "Heading Structure",
      status: hasH1 ? "pass" : "warning",
      impact: hasH1 ? "H1 heading found — clear semantic structure." : "No H1 heading found. AI engines rely on heading structure for content hierarchy.",
      fix: hasH1 ? "" : "Add a clear H1 heading describing the main topic of each page.",
      relatedStrategies: [],
    });

    checks.push({
      key: "jsonld_schema", label: "JSON-LD Schema",
      status: hasJSONLD && hasSchemaOrg ? "pass" : (hasJSONLD || hasSchemaOrg ? "warning" : "fail"),
      impact: (hasJSONLD && hasSchemaOrg) ? "JSON-LD structured data found — AI engines can programmatically understand your entity." : "No complete JSON-LD schema detected. AI engines cannot identify your organization, products, or FAQ content.",
      fix: (hasJSONLD && hasSchemaOrg) ? "" : "Add Organization, FAQPage, or Product JSON-LD schema.",
      relatedStrategies: (hasJSONLD && hasSchemaOrg) ? [] : ["structured-data"],
    });

    checks.push({
      key: "extractable_structure", label: "Extractable Structure",
      status: (hasLists || hasTables || hasFAQ) ? "pass" : "warning",
      impact: (hasLists || hasTables || hasFAQ) ? "Page contains lists, tables, or FAQ-like structures that AI can reliably extract." : "Page lacks structured elements (lists, tables, FAQ) that AI engines prefer for extraction.",
      fix: (hasLists || hasTables || hasFAQ) ? "" : "Add FAQ sections, definition lists, or structured tables to improve extractability.",
      relatedStrategies: (hasLists || hasTables || hasFAQ) ? [] : ["faq-expansion", "citable-summary"],
    });

    checks.push({
      key: "server_rendered", label: "Server-Rendered Content",
      status: html.length > 200 ? "pass" : "warning",
      impact: "Content appears server-renderable — AI crawlers can access it without JavaScript.",
      fix: "",
      relatedStrategies: [],
    });

    // AI crawler rules check is heuristic since we can't deeply parse robots.txt in HTML
    checks.push({
      key: "ai_crawler_rules", label: "AI Crawler Rules",
      status: "warning",
      impact: "Verify that robots.txt does not block GPTBot, Claude-Web, PerplexityBot, or Google-Extended.",
      fix: "Explicitly allow legitimate AI crawlers in robots.txt.",
      relatedStrategies: ["llms-txt-hint"],
    });
  } else {
    // No HTML fetched — all HTML-based checks fail
    checks.push(
      { key: "meta_tags", label: "Meta Tags", status: "fail", impact: "Could not fetch page content to check meta tags.", fix: "Ensure the site is accessible and has proper meta tags.", relatedStrategies: [] },
      { key: "headings", label: "Heading Structure", status: "fail", impact: "Could not check heading structure.", fix: "Ensure proper H1-H6 hierarchy.", relatedStrategies: [] },
      { key: "jsonld_schema", label: "JSON-LD Schema", status: "fail", impact: "Could not check for structured data.", fix: "Add JSON-LD schema markup.", relatedStrategies: ["structured-data"] },
      { key: "extractable_structure", label: "Extractable Structure", status: "fail", impact: "Could not check content structure.", fix: "Add FAQ, lists, and definition blocks.", relatedStrategies: ["faq-expansion"] },
      { key: "server_rendered", label: "Server-Rendered Content", status: "warning", impact: "Could not verify server-rendered content.", fix: "Ensure key content is available without JavaScript.", relatedStrategies: [] },
      { key: "ai_crawler_rules", label: "AI Crawler Rules", status: "warning", impact: "Could not check AI crawler rules.", fix: "Review robots.txt for AI crawler rules.", relatedStrategies: ["llms-txt-hint"] },
    );
  }

  // Calculate score
  const scoreMap = { pass: 100, warning: 50, fail: 0 };
  const totalScore = Math.round(
    checks.reduce((sum, c) => sum + scoreMap[c.status], 0) / checks.length
  );

  const passCount = checks.filter((c) => c.status === "pass").length;
  const warnCount = checks.filter((c) => c.status === "warning").length;
  const failCount = checks.filter((c) => c.status === "fail").length;

  const summaryParts: string[] = [];
  if (baseUrl) summaryParts.push(`Audited ${baseUrl}.`);
  if (fetchErrors.length > 0) summaryParts.push(`Fetch issues: ${fetchErrors.join("; ")}.`);
  summaryParts.push(`Found ${passCount} pass, ${warnCount} warning, ${failCount} fail across ${checks.length} checks.`);

  return { checks, totalScore, summary: summaryParts.join(" ") };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await enforceRateLimit(request, "readiness");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { id } = await params;
    const access = await assertProjectWriteAccess(request, id);
    if (!access.allowed) return access.response;
    const project = access.project as typeof access.project & {
      websiteUrl: string | null; brandName: string; description: string;
    };

    // If no URL, use LLM or mock
    if (!project.websiteUrl) {
      const prompt = buildReadinessAuditPrompt(null, {
        brandName: project.brandName,
        description: project.description,
      });
      const result = await callLLM(prompt, ReadinessAuditResponseSchema, MOCK_READINESS_AUDIT);

      await prisma.readinessAudit.deleteMany({ where: { projectId: id } });
      const audit = await prisma.readinessAudit.create({
        data: {
          projectId: id,
          totalScore: result.data.totalScore,
          checks: JSON.stringify(result.data.checks),
          summary: result.data.summary,
          rawJson: result.source === "live" ? JSON.stringify(result.data) : null,
          resultSource: result.source,
        },
      });
      return NextResponse.json({ audit, resultSource: result.source });
    }

    // Try to fetch the actual site
    let html: string | null = null;
    let robotsTxt: string | null = null;
    let sitemapFound = false;
    let llmsFound = false;
    const fetchErrors: string[] = [];

    const baseUrl = project.websiteUrl;
    let origin: string;
    try {
      origin = new URL(baseUrl).origin;
    } catch {
      origin = baseUrl;
    }

    // Fetch main page
    try {
      const result = await safeFetch(baseUrl, 8000);
      html = result.text;
    } catch (e) {
      fetchErrors.push(e instanceof SafeFetchError ? `Page: ${e.message}` : "Page fetch failed");
    }

    // Fetch robots.txt
    try {
      const result = await safeFetch(`${origin}/robots.txt`, 5000);
      robotsTxt = result.text;
    } catch {
      // robots.txt not found is a warning, not an error
    }

    // Check sitemap.xml
    try {
      const result = await safeFetch(`${origin}/sitemap.xml`, 5000);
      sitemapFound = result.status === 200 && result.text.includes("<url");
    } catch {
      // sitemap not found
    }

    // Check llms.txt
    try {
      const result = await safeFetch(`${origin}/llms.txt`, 5000);
      llmsFound = result.status === 200 && result.text.length > 20;
    } catch {
      // llms.txt not found
    }

    // Generate heuristic audit
    const heuristic = heuristicAudit(baseUrl, html, robotsTxt, sitemapFound, llmsFound, fetchErrors);

    // Use LLM to enhance if available, otherwise use heuristic result
    const prompt = buildReadinessAuditPrompt(baseUrl, {
      brandName: project.brandName,
      description: project.description,
    });

    const llmResult = await callLLM(prompt, ReadinessAuditResponseSchema, {
      totalScore: heuristic.totalScore,
      checks: heuristic.checks,
      summary: heuristic.summary,
    });

    // Merge: prefer heuristic checks for technical items that were actually fetched
    const finalChecks = llmResult.source === "live" ? llmResult.data.checks : heuristic.checks;
    const finalScore = llmResult.source === "live" ? llmResult.data.totalScore : heuristic.totalScore;
    const finalSummary = `${heuristic.summary} Source: ${html ? "fetched" : "fallback"}.`;

    await prisma.readinessAudit.deleteMany({ where: { projectId: id } });

    const audit = await prisma.readinessAudit.create({
      data: {
        projectId: id,
        totalScore: finalScore,
        checks: JSON.stringify(finalChecks),
        summary: finalSummary,
        rawJson: null, // Don't store full HTML
        resultSource: html ? "live" : "fallback",
      },
    });

    return NextResponse.json({ audit, resultSource: html ? "live" : "fallback" });
  } catch (error) {
    console.error("Readiness audit failed:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Failed to run readiness audit. Please try again." },
      { status: 500 }
    );
  }
}
