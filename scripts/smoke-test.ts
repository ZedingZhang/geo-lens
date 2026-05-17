#!/usr/bin/env tsx
/**
 * GEO Lens Smoke Test
 *
 * Validates all critical API paths.
 * Requires the dev server to be running: pnpm dev
 *
 * Usage: pnpm test:smoke
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";

interface TestResult {
  name: string;
  pass: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];
let cookieJar = "";

function saveCookies(headers: Headers) {
  const setCookie = headers.get("set-cookie");
  if (setCookie) {
    // Merge new cookies into jar
    const newCookies = setCookie.split(",").map((c) => c.trim().split(";")[0]);
    for (const c of newCookies) {
      const [name, ...valueParts] = c.split("=");
      const value = valueParts.join("=");
      const existing = cookieJar
        .split("; ")
        .filter(Boolean)
        .filter((e) => !e.startsWith(name + "="));
      existing.push(`${name}=${value}`);
      cookieJar = existing.join("; ");
    }
  }
}

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, pass: true, duration: Date.now() - start });
    console.log(`  ✓ ${name} (${Date.now() - start}ms)`);
  } catch (e) {
    results.push({
      name,
      pass: false,
      error: e instanceof Error ? e.message : String(e),
      duration: Date.now() - start,
    });
    console.log(`  ✗ ${name}: ${results[results.length - 1].error}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchJSON(path: string, init?: RequestInit): Promise<any> {
  const url = `${BASE}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> || {}),
  };
  if (cookieJar) headers["Cookie"] = cookieJar;
  const res = await fetch(url, { ...init, headers });
  saveCookies(res.headers);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function main() {
  console.log(`\nGEO Lens Smoke Test — ${BASE}\n`);

  // Check health
  await test("Health endpoint", async () => {
    const data = await fetchJSON("/api/health");
    if (data.status !== "ok") throw new Error("Health check failed");
  });

  // Check strategies
  await test("Strategy Library API", async () => {
    const data = await fetchJSON("/api/strategies");
    if (!Array.isArray(data.strategies)) throw new Error("Expected strategies array");
    if (data.strategies.length < 5) throw new Error(`Expected >= 5 strategies, got ${data.strategies.length}`);
  });

  // Create project
  let projectId = "";
  await test("Create project", async () => {
    const data = await fetchJSON("/api/projects", {
      method: "POST",
      body: JSON.stringify({
        name: "Smoke Test Project",
        brandName: "SmokeTest Brand",
        description: "A test project for smoke testing the GEO Lens platform.",
        audience: "QA Engineers",
        product: "Smoke Testing Framework",
        keywords: ["geo", "ai", "testing"],
        competitors: ["CompetitorA"],
      }),
    });
    if (!data.project?.id) throw new Error(`No project ID: ${JSON.stringify(data)}`);
    projectId = data.project.id as string;
  });

  if (!projectId) {
    console.log("\n  ⚠ Cannot continue without project ID. Stopping.\n");
    printSummary();
    return;
  }

  // Run analysis
  await test("Run GEO Analysis", async () => {
    const data = await fetchJSON(`/api/projects/${projectId}/analyze`, { method: "POST" });
    if (!data.analysis?.totalScore) throw new Error("No analysis score returned");
    if (!["mock", "live", "fallback"].includes(data.resultSource as string)) {
      throw new Error(`Unexpected resultSource: ${data.resultSource}`);
    }
  });

  // Generate questions
  await test("Generate AI Questions", async () => {
    const data = await fetchJSON(`/api/projects/${projectId}/questions`, { method: "POST" });
    if (!Array.isArray(data.questions)) throw new Error("Expected questions array");
    if (data.questions.length < 3) throw new Error(`Expected >= 3 questions, got ${data.questions.length}`);
  });

  // Generate recommendations
  await test("Generate Recommendations", async () => {
    const data = await fetchJSON(`/api/projects/${projectId}/recommendations`, { method: "POST" });
    if (!Array.isArray(data.recommendations)) throw new Error("Expected recommendations array");
  });

  // Run diagnostics
  await test("Run Citation Diagnostics", async () => {
    const data = await fetchJSON(`/api/projects/${projectId}/diagnostics`, { method: "POST" });
    if (!Array.isArray(data.diagnoses)) throw new Error("Expected diagnoses array");
  });

  // Generate diff
  await test("Generate Before/After Diff", async () => {
    const data = await fetchJSON(`/api/projects/${projectId}/diff`, {
      method: "POST",
      body: JSON.stringify({ content: "We help teams improve AI visibility.", strategy: "Citable Summary" }),
    });
    if (!data.diff?.afterContent) throw new Error("No diff afterContent");
  });

  // Run readiness audit (no URL = fallback mode)
  await test("Run Readiness Audit (fallback)", async () => {
    const data = await fetchJSON(`/api/projects/${projectId}/readiness`, { method: "POST" });
    if (!data.audit?.totalScore) throw new Error("No audit score");
  });

  // Generate prompts
  await test("Generate Prompt Portfolio", async () => {
    const data = await fetchJSON(`/api/projects/${projectId}/prompts`, { method: "POST" });
    if (!Array.isArray(data.prompts)) throw new Error("Expected prompts array");
  });

  // Generate source map
  await test("Generate Source Map", async () => {
    const data = await fetchJSON(`/api/projects/${projectId}/sources`, { method: "POST" });
    if (!Array.isArray(data.sources)) throw new Error("Expected sources array");
  });

  // Create experiment
  let experimentId = "";
  await test("Create Experiment", async () => {
    const data = await fetchJSON(`/api/projects/${projectId}/experiments`, {
      method: "POST",
      body: JSON.stringify({ name: "Smoke Test Experiment", baselineScore: 60 }),
    });
    if (!data.experiment?.id) throw new Error("No experiment ID");
    experimentId = data.experiment.id as string;
  });

  if (experimentId) {
    await test("Update Experiment Status", async () => {
      await fetchJSON(`/api/projects/${projectId}/experiments/${experimentId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "running", afterScore: 72 }),
      });
    });
  }

  // Get report
  await test("Generate Report", async () => {
    const data = await fetchJSON(`/api/projects/${projectId}/report`);
    if (!data.markdown) throw new Error("No markdown in report");
    if (typeof data.markdown !== "string" || data.markdown.length < 100) {
      throw new Error("Report too short");
    }
  });

  // Metadata files
  await test("GET /robots.txt", async () => {
    const res = await fetch(`${BASE}/robots.txt`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes("User-agent")) throw new Error("Missing User-agent directive");
  });

  await test("GET /sitemap.xml", async () => {
    const res = await fetch(`${BASE}/sitemap.xml`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes("<urlset")) throw new Error("Missing urlset element");
  });

  await test("GET /llms.txt", async () => {
    const res = await fetch(`${BASE}/llms.txt`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes("GEO Lens")) throw new Error("Missing project name");
  });

  // Clean up
  await test("Delete project", async () => {
    await fetchJSON(`/api/projects/${projectId}`, { method: "DELETE" });
  });

  printSummary();
}

function printSummary() {
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n${"─".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${results.length} total\n`);

  if (failed > 0) {
    console.log("Failures:");
    results.filter((r) => !r.pass).forEach((r) => {
      console.log(`  ✗ ${r.name}: ${r.error}`);
    });
    console.log();
    process.exit(1);
  }

  console.log("All smoke tests passed! ✓\n");
}

main().catch((e) => {
  console.error(`\n  ⚠ Smoke test failed to start: ${e.message}`);
  console.error("  Make sure the dev server is running: pnpm dev\n");
  process.exit(1);
});
