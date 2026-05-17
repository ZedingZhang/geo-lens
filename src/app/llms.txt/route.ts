import { NextResponse } from "next/server";

export async function GET() {
  const content = `# GEO Lens

GEO Lens is a generative engine optimization (GEO) analysis platform designed for content teams and personal brands. It evaluates whether a brand can be discovered, summarized, and cited by AI answer engines.

## Project Info
- Tech Stack: Next.js, TypeScript, Prisma, PostgreSQL, OpenAI-compatible API
- Deployment: Vercel + Neon, or Docker Compose + VPS
- Open Source: MIT License
- Repository: https://github.com/your-username/geo-lens

## Key Pages
- / : Dashboard and project overview
- /projects : Browse and manage GEO analysis projects
- /strategies : Browse GEO optimization strategies and examples
- /settings : View environment configuration

## Features
- Five-dimension GEO scoring (Entity Clarity, Answer Coverage, Citation Readiness, Content Structure, Freshness Signal)
- AI answer simulation and citation failure diagnosis
- Before/After GEO content diff
- AI Readiness Technical Audit
- Prompt Portfolio management
- Citation Source Map analysis
- GEO Experiment Tracker
- Markdown report export

## API
- /api/health : Health check endpoint

## Documentation
See README.md for setup, deployment, and environment variable documentation.
`;

  return new NextResponse(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
