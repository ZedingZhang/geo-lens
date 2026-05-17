# GEO Lens — Generative Engine Optimization Platform

> Measure and improve your visibility in AI-powered search engines.

[![CI](https://github.com/nebula167/geo-lens/actions/workflows/ci.yml/badge.svg)](https://github.com/nebula167/geo-lens/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)

**Live Demo:** Deploy with Vercel + Neon → [Deployment Guide](./DEPLOYMENT.md)

English | [中文](./README_CN.md)

---

## What is GEO Lens?

GEO Lens is a **Generative Engine Optimization** analysis platform for content teams and personal brands. It evaluates whether your brand can be **discovered, summarized, and cited** by AI answer engines like ChatGPT, Perplexity, and Google AI Overviews.

### Why GEO matters

Traditional SEO measures keyword rankings and organic traffic. But users increasingly ask AI engines natural-language questions, and those AI engines decide which brands to mention — based on entity clarity, citable facts, structured data, and comparison context. GEO Lens measures exactly these signals.

---

## Features

### P0 — Core Workflow
- **Project Management:** Create GEO analysis projects with brand info, keywords, competitors
- **Five-Dimension GEO Scoring:** Entity Clarity · Answer Coverage · Citation Readiness · Content Structure · Freshness Signal
- **Score Dashboard:** Radar/bar charts with strengths, weaknesses, and priority actions
- **AI Answer Simulation:** Generate 8 realistic AI search queries and see if your brand is mentioned
- **Content Recommendations:** 10 types of GEO-optimized content (FAQ, schema, definitions, meta tags...)
- **Markdown Report Export:** Downloadable report with all analysis results

### P1 — Research Differentiators
- **Citation Failure Diagnosis:** Diagnose *why* AI engines don't cite your brand (7 failure types, severity-rated)
- **Before / After GEO Diff:** Side-by-side content comparison showing GEO improvement
- **Strategy Library:** 9 built-in GEO strategies with before/after examples, filterable by dimension

### P2 — Lightweight Enterprise Modules
- **AI Readiness Technical Audit:** 8-point technical check (robots.txt, sitemap.xml, llms.txt, JSON-LD schema...)
- **Prompt Portfolio:** 12 prompts across 6 intent types with funnel stage and demand scoring
- **Citation Source Map:** 8 source categories analyzed for AI citation coverage gaps
- **GEO Experiment Tracker:** Create, run, complete experiments tracking baseline → after score deltas

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI | Lucide React, Recharts |
| Database | PostgreSQL + Prisma 7 |
| LLM Integration | OpenAI SDK (DeepSeek-compatible) |
| Validation | Zod |
| Forms | React Hook Form |
| Deployment | Vercel + Neon, or Docker Compose + VPS |

---

## Architecture

```mermaid
graph TD
    Browser[Browser] --> Vercel[Vercel / Next.js]
    Vercel --> API[API Routes]
    API --> LLM[LLM Client]
    API --> Prisma[Prisma Client]
    LLM --> DeepSeek[DeepSeek API]
    LLM --> Mock[Mock Fallback]
    Prisma --> DB[(PostgreSQL / Neon)]
    DB --> Cleanup[Demo Cleanup Cron]

    subgraph "Demo Mode"
        Mock
    end

    subgraph "Live Mode"
        DeepSeek
    end

    subgraph "Deployment Options"
        Vercel
        Docker[Docker Compose + VPS]
    end
```

---

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22+
- pnpm
- PostgreSQL 16+ (or Docker)

### Local Development

```bash
# Clone
git clone https://github.com/nebula167/geo-lens.git
cd geo-lens

# Install dependencies
pnpm install

# Start PostgreSQL (if using Docker)
docker compose up -d postgres

# Copy env
cp .env.example .env

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate:dev

# Seed sample data
pnpm db:seed

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

See [.env.example](./.env.example) for the full list. Key variables:

```bash
# LLM (leave API_KEY empty for mock mode)
LLM_API_KEY=              # DeepSeek API key
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-v4-flash

# Database
DATABASE_URL=postgresql://geo_lens:geo_lens_password@localhost:5432/geo_lens

# Demo Mode (public demo safety)
DEMO_MODE=true
RATE_LIMIT_PER_HOUR=20
MAX_PROJECTS_PER_DEMO_SESSION=5
DEMO_DATA_RETENTION_DAYS=7
CRON_SECRET=change_me
```

> **Important:** `deepseek-v4-flash` and `deepseek-v4-pro` are the current recommended models. `deepseek-chat` is deprecated (EOL 2026-07-24) and should not be used as the default.

---

## Mock Mode vs Live LLM Mode

**Mock Mode (default for public demo):**
- No API key required
- Returns stable, realistic mock data
- Full feature flow works without LLM costs
- UI shows "Demo Mode" banner

**Live LLM Mode:**
- Set `LLM_API_KEY` and `DEMO_MODE=false`
- Real LLM calls with timeout and JSON validation
- Rate-limited (`RATE_LIMIT_PER_HOUR` per IP)
- Results tagged as `live`, `mock`, or `fallback`
- Input trimmed to `MAX_INPUT_CHARS`

---

## Deployment

**Resume Demo (recommended):** Vercel + Neon (free tier)
→ [DEPLOYMENT.md](./DEPLOYMENT.md#option-a-vercel--neon)

**Engineering Showcase:** Docker Compose + VPS
→ [DEPLOYMENT.md](./DEPLOYMENT.md#option-b-docker-compose--vps)

> **Platform Notes:** Free tiers can change. Check [Vercel Pricing](https://vercel.com/pricing) and [Neon Pricing](https://neon.com/pricing) before deploying.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # REST API (health, projects, analyze, etc.)
│   ├── projects/           # Project pages (CRUD, analysis modules)
│   ├── strategies/         # Strategy Library page
│   ├── settings/           # Environment config display
│   └── robots.txt|sitemap.xml|llms.txt/  # GEO/SEO metadata routes
├── components/             # React components
│   ├── analysis/           # Score charts
│   └── layout/             # AppShell, demo banner
├── lib/                    # Business logic
│   ├── llm/                # LLM client, schemas, prompts
│   ├── geo/                # Scoring, strategies, diff, readiness, source-map, experiments
│   ├── fetch/              # SSRF-safe URL fetching
│   ├── security/           # Rate limiting
│   ├── demo/               # Session isolation, cleanup
│   ├── report/             # Markdown report generation
│   ├── db.ts               # Prisma client singleton
│   ├── env.ts              # Environment config with Zod validation
│   └── mock-data.ts        # Stable mock data for demo mode
└── generated/prisma/       # Generated Prisma client
```

---

## Security & Privacy

### Public Demo Protections
- **Mock mode by default:** No real LLM API calls consume credits
- **Rate limiting:** `RATE_LIMIT_PER_HOUR` for generation endpoints
- **Input length limits:** `MAX_INPUT_CHARS` prevents token abuse
- **Anonymous session isolation:** Demo users see only their own projects
- **Data expiration:** Demo projects auto-expire after `DEMO_DATA_RETENTION_DAYS`
- **Cleanup requires auth:** `CRON_SECRET` protects cleanup endpoints

### Production Hardening
- `.env` and secrets excluded from Git via `.gitignore`
- API keys never exposed to frontend
- Error responses hide stack traces, DB credentials, and internal paths
- URL fetching uses `safe-fetch` blocking SSRF (localhost, private IPs, metadata addresses)
- Server logs exclude full user input, full prompts, and raw LLM responses
- IP addresses stored as salted hashes

### LLM Safety
- All LLM outputs validated with Zod schemas
- Timeout control (`LLM_TIMEOUT_MS`) prevents hanging
- JSON parse failures → graceful mock fallback
- Results tagged by source: `mock` | `live` | `fallback`

---

## GEO Scoring Model

| Dimension | What It Measures |
|-----------|-----------------|
| **Entity Clarity** | Can AI engines clearly identify what your brand is? |
| **Answer Coverage** | Does your content answer the questions users ask AI? |
| **Citation Readiness** | Is your content quotable with specific facts, numbers, dates? |
| **Content Structure** | Is content structured for AI extraction (FAQs, lists, schema)? |
| **Freshness Signal** | Does content have dates, versions, update indicators? |

---

## Why This Is a GEO Project

GEO Lens is not just an AI content generator. It implements:
- A **structured scoring model** for AI citation potential
- **Citation failure diagnosis** connecting symptoms → root causes → fixes
- **Before/after content diff** showing measurable GEO improvement
- A **strategy library** of reusable optimization patterns
- **Source map analysis** identifying where AI engines get citation signals
- Its own `/robots.txt`, `/sitemap.xml`, and `/llms.txt` as GEO best practice

---

## Technical Highlights

- **LLM JSON Schema Validation:** All LLM outputs validated with Zod; failures fall back to mock data
- **Mock Fallback System:** Stable mock data enables full feature demo without API keys
- **Rate Limiting:** In-memory rate limiter with salted IP hashing
- **Dual Deployment:** Vercel + Neon for resume demos; Docker Compose + VPS for engineering showcase
- **SSRF Protection:** URL fetching blocks localhost, private IPs, metadata endpoints
- **Demo Session Isolation:** Anonymous users see only their data; auto-cleanup prevents pollution

---

## Design Decisions & Tradeoffs

| Decision | Rationale |
|----------|----------|
| No user authentication | MVP targets resume demo; auth adds complexity without demo value |
| Mock mode default | Prevents API key abuse on public demo; makes project self-contained |
| PostgreSQL (not SQLite) | Required for production deployment; Neon free tier makes it accessible |
| TypeScript constants for strategies | Simple, version-controlled, no DB migration for content |
| Markdown reports (not PDF) | Faster to implement, more useful for copy-paste workflows |
| No real search API integration | Keeps project zero-cost; mock data demonstrates the concept |

---

## 2-Minute Interview Pitch

> "GEO Lens is a full-stack SaaS prototype I built to address the emerging field of Generative Engine Optimization. As AI answer engines like ChatGPT and Perplexity become primary information sources, traditional SEO metrics don't capture whether brands get cited in AI-generated answers.
>
> I designed a five-dimension scoring model — Entity Clarity, Answer Coverage, Citation Readiness, Content Structure, and Freshness Signal — and built the entire analysis pipeline from project creation through AI simulation, citation failure diagnosis, and structured recommendations.
>
> The tech stack uses Next.js 16 with the App Router, Prisma 7 with PostgreSQL, and an OpenAI-compatible LLM layer that supports DeepSeek. I implemented LLM JSON schema validation with Zod, graceful mock fallbacks, rate limiting, SSRF-safe URL fetching, and anonymous session isolation for the public demo.
>
> There are three research-grade features — Citation Failure Diagnosis that maps symptoms to root causes, Before/After GEO Diff showing measurable content improvement, and a Strategy Library encoding 9 reusable optimization patterns. I also included lightweight enterprise features like Technical Audit, Prompt Portfolio, Source Map, and Experiment Tracker.
>
> The project deploys two ways: Vercel + Neon for a zero-cost resume demo, and Docker Compose + VPS to demonstrate production engineering skills. It includes CI/CD, health checks, and comprehensive security hardening."

---

## Resume Description

```
GEO Lens | Generative Engine Optimization Platform
• Built full-stack SaaS prototype with Next.js 16, TypeScript, Prisma, PostgreSQL
• Designed five-dimension GEO scoring model quantifying AI citation potential
• Implemented LLM service layer with Zod schema validation, mock fallback, and rate limiting
• Created Citation Failure Diagnosis, Before/After Diff, and Strategy Library as research differentiators
• Added AI Readiness Technical Audit, Prompt Portfolio, Citation Source Map, and Experiment Tracker
• Deployed via Vercel + Neon (resume demo) and Docker Compose + VPS (engineering showcase)
• Implemented demo mode with anonymous session isolation, data expiration, and SSRF protection
```

---

## Screenshots

> Add 3-5 screenshots showing:
> 1. Project Dashboard with GEO Score chart
> 2. AI Answer Simulation results
> 3. Citation Failure Diagnosis panel
> 4. Before/After Diff comparison
> 5. Strategy Library with filters

*Screenshots placeholder — add your own or check the live demo.*

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

## Contributing

This is a portfolio project. Bug reports and suggestions are welcome via GitHub Issues.

---

**GitHub:** [https://github.com/nebula167/geo-lens](https://github.com/nebula167/geo-lens)
