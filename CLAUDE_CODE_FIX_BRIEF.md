# Claude Code 修复指挥文档：GEO Lens 上线前问题修复

> 目标：修复当前 GEO Lens 项目中影响公开 demo、Docker 部署和简历展示可信度的关键问题。请按优先级逐项处理，不要新增无关功能。
>
> 执行环境：VSCode Claude Code，使用 DeepSeek V4 API 或其他 OpenAI-compatible API 均可。

---

## 0. 当前状态

项目路径：

```bash
/Users/zzd/project/geo-lens
```

当前已通过：

```bash
pnpm typecheck
pnpm lint
pnpm build
```

但存在几个上线前必须修复的问题：

1. Demo session 隔离不完整，公开 demo 会串数据。
2. Dockerfile 与 Next.js standalone 输出不匹配，Docker 部署会失败。
3. `docker-compose.yml` 只有 PostgreSQL，没有 app service。
4. AI Readiness Audit 没有真正使用 `safe-fetch` 做技术检查。
5. 公开 demo 下 rate limit 没生效。
6. `test:smoke` 只是 echo，没有真实验证关键路径。
7. 部分 lint warnings 和无用 import 需要清理。

---

## 1. P0：修复 Demo Session 隔离

### 问题

当前 `POST /api/projects` 在 demo mode 下生成了 `demoSessionHash`，但没有把 `geo_lens_demo_session` 写回浏览器 cookie。结果：

- 用户创建项目后，后续列表请求拿不到同一个 session。
- `/projects` 页面直接查全量项目。
- `/api/projects/[id]` 没有校验当前 session 是否有权访问该 project。
- 公开 demo 中不同访客可能看到或操作彼此项目。

相关文件：

```text
src/app/api/projects/route.ts
src/app/api/projects/[id]/route.ts
src/app/projects/page.tsx
src/app/page.tsx
src/lib/demo/session.ts
```

### 修复要求

1. 在 demo mode 下，第一次访问或创建项目时设置 httpOnly cookie：

```text
geo_lens_demo_session=<session_hash>
```

cookie 要求：

- `httpOnly: true`
- `sameSite: "lax"`
- `secure: process.env.NODE_ENV === "production"`
- `path: "/"`
- 合理 maxAge，例如 `DEMO_DATA_RETENTION_DAYS * 24 * 60 * 60`

2. 项目列表 API 必须只返回：

- 当前 session 创建的项目
- seed/sample 项目

建议 where：

```ts
where: isDemo
  ? { OR: [{ demoSessionHash: sessionHash }, { isSample: true }] }
  : {}
```

3. 项目详情、删除、所有项目子资源生成 API 必须校验访问权限。

规则：

- sample 项目可读。
- 当前 session 创建的项目可读写。
- demo mode 下不允许访问其他 session 的非 sample 项目。
- 对 sample 项目执行生成类操作时，建议复制为当前 session 项目，或者禁止写入 sample 项目并返回友好提示。首版可以禁止写入 sample 项目。

4. `/projects` 和 `/` 页面不要直接查全量项目。它们应通过同一套 session-aware 查询逻辑，或转为调用 API。

### 建议实现

在 `src/lib/demo/session.ts` 增加：

```ts
export const DEMO_SESSION_COOKIE = "geo_lens_demo_session";

export function createDemoSessionHash(): string;
export function getDemoCookieOptions(): CookieOptions;
export async function getOrCreateDemoSessionFromRequest(request: NextRequest): Promise<{
  sessionHash: string;
  shouldSetCookie: boolean;
}>;
```

在 `src/lib/demo/access.ts` 新增：

```ts
export async function assertProjectAccess(params): Promise<Project>;
export async function assertProjectWriteAccess(params): Promise<Project>;
```

避免每个 route handler 重复写权限逻辑。

### 验收

- 新访客创建项目后，刷新 `/projects` 仍能看到该项目。
- demo mode 下，手动换一个 cookie 后不能访问前一个 session 的非 sample 项目。
- sample 项目可以展示，但不能被匿名访客直接写入污染。

---

## 2. P0：修复公开 Demo Rate Limit

### 问题

当前 `withRateLimit` 只在 `DEMO_MODE=false` 时启用。公开 demo 通常是 `DEMO_MODE=true`，所以生成类 API 不限流。

相关文件：

```text
src/lib/security/rate-limit.ts
src/app/api/projects/[id]/*/route.ts
src/app/api/projects/route.ts
```

### 修复要求

1. 生成类接口在 demo mode 和 live mode 都应该限流。

至少这些接口要限流：

```text
POST /api/projects
POST /api/projects/[id]/analyze
POST /api/projects/[id]/questions
POST /api/projects/[id]/recommendations
POST /api/projects/[id]/diagnostics
POST /api/projects/[id]/diff
POST /api/projects/[id]/readiness
POST /api/projects/[id]/prompts
POST /api/projects/[id]/sources
POST /api/projects/[id]/experiments
PATCH /api/projects/[id]/experiments/[experimentId]
DELETE /api/projects/[id]/experiments/[experimentId]
```

2. GET 读取类接口可以不强制限流，但不能泄露其他 session 数据。

3. `UsageEvent` 模型已经存在，建议将限流事件记录到数据库，至少记录：

```ts
ipHash
action
mode
createdAt
```

4. 不要保存明文 IP。

### 注意

当前内存 Map rate limit 在 Vercel serverless 环境不稳定，但可以作为 MVP。更好的做法是用 `UsageEvent` 做数据库级小时窗口计数。

建议实现：

```ts
export async function enforceRateLimit(request: NextRequest, action: string): Promise<NextResponse | null>
```

并替换旧的 `withRateLimit`。

### 验收

- `DEMO_MODE=true` 时，连续超过 `RATE_LIMIT_PER_HOUR` 次生成请求会返回 429。
- 429 响应不暴露内部信息。
- 数据库中只记录 `ipHash`，不记录明文 IP。

---

## 3. P0：修复 Docker 部署

### 问题

当前 Dockerfile 使用：

```dockerfile
COPY --from=builder /app/.next/standalone ./
```

但 `next.config.ts` 没有：

```ts
output: "standalone"
```

本地 `pnpm build` 后 `.next/standalone` 不存在，因此 Docker build 会失败。

同时 `docker-compose.yml` 只有 PostgreSQL，没有 app service，不满足部署要求。

相关文件：

```text
next.config.ts
Dockerfile
docker-compose.yml
DEPLOYMENT.md
```

### 修复要求

1. 在 `next.config.ts` 中添加：

```ts
const nextConfig: NextConfig = {
  output: "standalone",
};
```

2. 更新 `docker-compose.yml`，至少包含：

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    ...
```

3. app service 必须能访问 postgres service：

```bash
DATABASE_URL=postgresql://geo_lens:geo_lens_password@postgres:5432/geo_lens
DIRECT_URL=postgresql://geo_lens:geo_lens_password@postgres:5432/geo_lens
```

4. 文档里写清楚迁移命令：

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app node prisma/seed.ts # 如果此命令不可行，请提供正确 seed 命令
```

5. 确保 Dockerfile 能找到 Prisma generated client。当前 Prisma client 输出到 `src/generated/prisma`，并且 `.gitignore` 忽略该目录，所以 Docker build 内必须执行 `prisma generate`。

### 验收

在有 Docker 的环境中应通过：

```bash
docker compose config
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
curl http://localhost:3000/api/health
```

如果当前机器没有 Docker，至少保证：

```bash
pnpm build
test -d .next/standalone
```

---

## 4. P1：让 AI Readiness Audit 真正使用 safe-fetch

### 问题

当前 `src/lib/fetch/safe-fetch.ts` 存在，但 `/api/projects/[id]/readiness` 没有使用它。readiness audit 只是把 URL 放进 LLM prompt，不是真正技术检查。

相关文件：

```text
src/app/api/projects/[id]/readiness/route.ts
src/lib/fetch/safe-fetch.ts
src/lib/geo/readiness.ts
src/lib/llm/prompts.ts
```

### 修复要求

1. 在 readiness route 中，如果项目有 `websiteUrl`：

- 使用 `safeFetch(websiteUrl)` 抓取首页 HTML。
- 使用 `safeFetch(origin + "/robots.txt")` 检查 robots。
- 使用 `safeFetch(origin + "/sitemap.xml")` 检查 sitemap。
- 使用 `safeFetch(origin + "/llms.txt")` 检查 llms。

2. `safeFetch` 必须增强 SSRF 防护：

- 不只检查 hostname 字符串，还要解析 DNS 后阻止私有 IP、loopback、link-local、metadata IP。
- 禁止 redirect 到内网地址。简单实现可设置 `redirect: "manual"` 并最多手动跟随 3 次，每次都校验 URL。
- 禁止非 http/https。

3. 用抓取结果生成启发式 checks：

- title 是否存在。
- meta description 是否存在。
- H1 是否存在。
- JSON-LD 是否存在。
- FAQ 迹象是否存在。
- robots 是否明显阻塞常见 AI crawler。
- sitemap 是否存在。
- llms.txt 是否存在。

4. 如果抓取失败，返回 fallback audit，但要在 resultSource 或 summary 中标记。

5. 不要把抓取到的完整 HTML 存数据库。

### 验收

- `https://example.com` 可以运行 audit。
- `http://localhost:3000`、`http://127.0.0.1`、`http://169.254.169.254` 必须被拒绝。
- redirect 到内网地址必须被拒绝。
- audit 结果中能看到 sitemap / robots / llms / meta / schema 等检查项。

---

## 5. P1：补真实 Smoke Test

### 问题

当前：

```json
"test:smoke": "echo 'Smoke test: verify build passes and pages load'"
```

这不是真测试。

相关文件：

```text
package.json
scripts/
```

### 修复要求

实现一个真实 smoke test 脚本，例如：

```text
scripts/smoke-test.ts
```

建议流程：

1. 检查 `/api/health`。
2. 创建项目。
3. 运行 analyze。
4. 运行 questions。
5. 运行 recommendations。
6. 运行 diagnostics。
7. 运行 diff。
8. 运行 readiness。
9. 运行 prompts。
10. 运行 sources。
11. 创建 experiment。
12. 获取 report。

脚本可要求本地服务已启动：

```bash
pnpm dev
pnpm test:smoke
```

或者用 `next start` + 子进程启动，但首版可以要求用户先启动服务。

更新 `package.json`：

```json
"test:smoke": "tsx scripts/smoke-test.ts"
```

### 验收

```bash
pnpm test:smoke
```

如果服务未启动，应给出清晰提示，而不是静默通过。

---

## 6. P1：清理 lint warnings

当前 warnings 包括未使用 import、React Hook Form watch 的 compiler warning 等。

要求：

- 删除未使用 import。
- 如果 React Compiler 对 `watch()` 报 warning，可改用 `useWatch`。
- `pnpm lint` 最终最好 0 warnings。

验收：

```bash
pnpm lint
```

---

## 7. P2：整理报告逻辑

当前 `src/lib/report/markdown.ts` 没有实现，报告生成逻辑直接写在 route 中。

这是架构偏差，不是上线阻塞，但建议修。

要求：

- 新增：

```text
src/lib/report/markdown.ts
```

- 把 Markdown report 组装逻辑从：

```text
src/app/api/projects/[id]/report/route.ts
```

移到 `src/lib/report/markdown.ts`。

API route 只负责查数据、调用 report builder、返回 JSON。

验收：

```bash
pnpm typecheck
pnpm build
```

---

## 8. 必跑验证命令

每轮修复后运行：

```bash
pnpm typecheck
pnpm lint
pnpm build
```

如果可用 Docker，再运行：

```bash
docker compose config
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
curl http://localhost:3000/api/health
```

至少手动验证：

```bash
pnpm db:migrate:dev
pnpm db:seed
pnpm dev
pnpm test:smoke
```

---

## 9. 最终交付说明

修复完成后，请输出：

1. 修复了哪些问题。
2. 修改了哪些关键文件。
3. 哪些命令已通过。
4. 是否还有无法验证的项，例如本机没有 Docker。
5. 是否还有已知风险。

不要新增登录系统、PDF 导出、真实第三方 SEO API、Playwright E2E 等增强功能。这轮只处理上线前质量问题。
