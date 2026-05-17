# GEO Lens — Deployment Guide

## Prerequisites

- Node.js 22+ (or 20.19+)
- pnpm (recommended) or npm
- PostgreSQL 16+

---

## Option A: Vercel + Neon (Recommended for Portfolio Demo)

### 1. Set up Neon PostgreSQL

1. Go to [neon.com](https://neon.com) and create a free account
2. Create a new project, database, and copy the connection string
3. The connection string looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`

### 2. Deploy to Vercel

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Configure environment variables in Vercel project settings:

```bash
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
DEMO_MODE=true
CRON_SECRET=<random_string>
LLM_API_KEY=<your_deepseek_api_key>  # Optional, leave empty for mock mode
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-v4-flash
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

4. Deploy. Vercel will build and deploy automatically.

### 3. Run Database Migrations

```bash
# From your local machine, or use Vercel CLI:
npx prisma migrate deploy

# Optionally seed sample data:
pnpm db:seed
```

> **Note:** Vercel Hobby plan includes automatic CI/CD from GitHub. Free tier limits apply — see [vercel.com/pricing](https://vercel.com/pricing).
>
> **Note:** Neon Free plan includes 0.5GB storage and 100 CU-hours/month. See [neon.com/pricing](https://neon.com/pricing).

---

## Option B: Docker Compose + VPS (Self-Hosted)

### 1. Prepare the Server

```bash
# Install Docker and Docker Compose on your VPS
# Ubuntu example:
sudo apt update && sudo apt install docker.io docker-compose-v2 -y
```

### 2. Clone and Configure

```bash
git clone https://github.com/your-username/geo-lens.git
cd geo-lens
cp .env.example .env
# Edit .env with your production values
```

### 3. Update docker-compose.yml for Production

Create `docker-compose.prod.yml`:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://geo_lens:geo_lens_password@postgres:5432/geo_lens
      - DIRECT_URL=postgresql://geo_lens:geo_lens_password@postgres:5432/geo_lens
      - DEMO_MODE=true
      - CRON_SECRET=${CRON_SECRET}
      - LLM_API_KEY=${LLM_API_KEY}
      - LLM_BASE_URL=${LLM_BASE_URL:-https://api.deepseek.com}
      - LLM_MODEL=${LLM_MODEL:-deepseek-v4-flash}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: geo_lens
      POSTGRES_PASSWORD: geo_lens_password
      POSTGRES_DB: geo_lens
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U geo_lens"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### 4. Start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 5. Run Migrations

```bash
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### 6. Reverse Proxy (Nginx / Caddy)

Example Caddy config:

```caddy
geo-lens.your-domain.com {
    reverse_proxy localhost:3000
}
```

---

## Database Migration Commands

```bash
# Development (create migration)
pnpm db:migrate:dev

# Production (apply migrations)
pnpm db:migrate

# Push schema directly (no migration files)
pnpm db:push

# Seed sample data
pnpm db:seed

# Open Prisma Studio
pnpm db:studio
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LLM_API_KEY` | No | — | API key for LLM provider. Empty = mock mode |
| `LLM_BASE_URL` | No | `https://api.deepseek.com` | OpenAI-compatible API base URL |
| `LLM_MODEL` | No | `deepseek-v4-flash` | Model name |
| `LLM_TIMEOUT_MS` | No | `30000` | LLM request timeout in ms |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `DIRECT_URL` | No | — | Direct connection URL for migrations |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Public app URL |
| `DEMO_MODE` | No | `true` | Enable demo/mock mode |
| `RATE_LIMIT_PER_HOUR` | No | `20` | Max LLM requests per IP per hour |
| `MAX_INPUT_CHARS` | No | `2000` | Max input length for LLM prompts |
| `MAX_PROJECTS_PER_DEMO_SESSION` | No | `5` | Max projects per demo session |
| `DEMO_DATA_RETENTION_DAYS` | No | `7` | Days before demo data expires |
| `CRON_SECRET` | No | — | Secret for demo cleanup API |

---

## Health Check

```bash
curl https://your-domain.com/api/health
# {"status":"ok","timestamp":"2026-05-17T00:00:00.000Z","uptime":12345}
```

## Demo Data Cleanup

```bash
# Manual cleanup via API
curl -X POST https://your-domain.com/api/demo/cleanup \
  -H "Authorization: Bearer ${CRON_SECRET}"

# Or via Vercel Cron (GET endpoint)
curl https://your-domain.com/api/cron/demo-cleanup \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Database connection failed | Check `DATABASE_URL` format and network access |
| Prisma Client not generated | Run `npx prisma generate` |
| Migration failed | Run `pnpm db:migrate:dev` to create, `pnpm db:migrate` to apply |
| LLM timeout | Increase `LLM_TIMEOUT_MS` or check API endpoint |
| Build fails | Run `pnpm lint` and `pnpm typecheck`, check TypeScript errors |
| CORS errors | Configure `NEXT_PUBLIC_APP_URL` correctly |
