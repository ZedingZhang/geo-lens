# GEO Lens — 生成式引擎优化平台

> 衡量并提升你在 AI 搜索引擎中的可见度。

[![CI](https://github.com/nebula167/geo-lens/actions/workflows/ci.yml/badge.svg)](https://github.com/nebula167/geo-lens/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)

**在线演示：** [https://geo-lens.your-domain.com](https://geo-lens.your-domain.com)

[English](./README.md) | 中文

---

## 什么是 GEO Lens？

GEO Lens 是一个面向内容团队和个人品牌的**生成式引擎优化**（Generative Engine Optimization）分析平台。它评估你的品牌是否能被 ChatGPT、Perplexity、Google AI Overviews 等 AI 问答引擎**发现、总结和引用**。

### 为什么 GEO 重要

传统 SEO 衡量关键词排名和自然流量。但用户越来越多地用自然语言向 AI 引擎提问，而这些 AI 引擎会根据实体清晰度、可引用事实、结构化数据和对比语境来决定提及哪些品牌。GEO Lens 衡量的正是这些信号。

---

## 功能

### P0 — 核心工作流
- **项目管理：** 创建 GEO 分析项目，输入品牌信息、关键词、竞品
- **五维 GEO 评分：** 实体清晰度 · 答案覆盖度 · 引用友好度 · 内容结构 · 新鲜度信号
- **评分仪表盘：** 柱状图展示分数，附优势、劣势和优先级行动清单
- **AI 问答模拟：** 生成 8 个真实 AI 搜索问题，查看品牌是否被提及
- **内容优化建议：** 10 类 GEO 优化内容（FAQ、Schema、定义段落、meta 标签等）
- **Markdown 报告导出：** 可下载的完整分析报告

### P1 — 研究型差异化功能
- **引用失败诊断：** 诊断品牌*为什么*没被 AI 引用（7 种失败类型，按严重程度分级）
- **优化前后对比：** 左右对比内容改动，展示 GEO 提升
- **策略库：** 9 条内置 GEO 策略，含优化前后示例，可按维度筛选

### P2 — 轻量企业级模块
- **AI 就绪技术审计：** 8 项技术检查（robots.txt、sitemap.xml、llms.txt、JSON-LD Schema 等）
- **Prompt 组合：** 12 条 prompts 覆盖 6 种意图类型，含漏斗阶段和需求度评分
- **引用来源地图：** 8 个来源类别，分析 AI 引用覆盖缺口
- **GEO 实验追踪器：** 创建、运行、完成实验，追踪基线 → 优化后分数变化

---

## 技术栈

| 层级 | 技术 |
|-------|-----------|
| 框架 | Next.js 16 (App Router) + React 19 |
| 语言 | TypeScript（严格模式） |
| 样式 | Tailwind CSS v4 |
| UI | Lucide React, Recharts |
| 数据库 | PostgreSQL + Prisma 7 |
| LLM 集成 | OpenAI SDK（兼容 DeepSeek） |
| 校验 | Zod |
| 表单 | React Hook Form |
| 部署 | Vercel + Neon，或 Docker Compose + VPS |

---

## 架构图

```mermaid
graph TD
    Browser[浏览器] --> Vercel[Vercel / Next.js]
    Vercel --> API[API 路由]
    API --> LLM[LLM 客户端]
    API --> Prisma[Prisma 客户端]
    LLM --> DeepSeek[DeepSeek API]
    LLM --> Mock[Mock 兜底]
    Prisma --> DB[(PostgreSQL / Neon)]
    DB --> Cleanup[Demo 清理定时任务]

    subgraph "Demo 模式"
        Mock
    end

    subgraph "Live 模式"
        DeepSeek
    end

    subgraph "部署方案"
        Vercel
        Docker[Docker Compose + VPS]
    end
```

---

## 本地启动

### 环境要求

- Node.js 20.19+ 或 22+
- pnpm
- PostgreSQL 16+（或 Docker）

### 开发步骤

```bash
# 克隆仓库
git clone https://github.com/nebula167/geo-lens.git
cd geo-lens

# 安装依赖
pnpm install

# 启动 PostgreSQL（使用 Docker）
docker compose up -d postgres

# 复制环境变量
cp .env.example .env

# 生成 Prisma 客户端
pnpm db:generate

# 执行数据库迁移
pnpm db:migrate:dev

# 填充示例数据
pnpm db:seed

# 启动开发服务器
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

---

## 环境变量

完整列表见 [.env.example](./.env.example)。关键变量：

```bash
# LLM（留空则使用 mock 模式）
LLM_API_KEY=              # DeepSeek API 密钥
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-v4-flash

# 数据库
DATABASE_URL=postgresql://geo_lens:geo_lens_password@localhost:5432/geo_lens

# Demo 模式（公开演示安全配置）
DEMO_MODE=true
RATE_LIMIT_PER_HOUR=20
MAX_PROJECTS_PER_DEMO_SESSION=5
DEMO_DATA_RETENTION_DAYS=7
CRON_SECRET=change_me
```

> **注意：** `deepseek-v4-flash` 和 `deepseek-v4-pro` 是当前推荐模型。`deepseek-chat` 已标记弃用（2026-07-24 EOL），不应作为默认配置。

---

## Mock 模式 vs Live LLM 模式

**Mock 模式（公开 demo 默认）：**
- 无需 API Key
- 返回稳定、逼真的模拟数据
- 完整功能流程不消耗 LLM 费用
- UI 显示 "Demo Mode" 横幅

**Live LLM 模式：**
- 设置 `LLM_API_KEY` 和 `DEMO_MODE=false`
- 真实 LLM 调用，带超时和 JSON 校验
- 按 IP 限流（`RATE_LIMIT_PER_HOUR`）
- 结果标注来源：`live` / `mock` / `fallback`
- 输入裁剪至 `MAX_INPUT_CHARS`

---

## 部署

**简历演示（推荐）：** Vercel + Neon（免费额度）
→ [DEPLOYMENT.md](./DEPLOYMENT.md#option-a-vercel--neon)

**工程能力展示：** Docker Compose + VPS
→ [DEPLOYMENT.md](./DEPLOYMENT.md#option-b-docker-compose--vps)

> **平台说明：** 免费额度可能变化。部署前请查看 [Vercel 定价](https://vercel.com/pricing) 和 [Neon 定价](https://neon.com/pricing)。

---

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面与 API 路由
│   ├── api/                # REST API（health, projects, analyze 等）
│   ├── projects/           # 项目页面（CRUD、分析模块）
│   ├── strategies/         # 策略库页面
│   ├── settings/           # 环境配置展示
│   └── robots.txt|sitemap.xml|llms.txt/  # GEO/SEO 元数据路由
├── components/             # React 组件
│   ├── analysis/           # 分数图表
│   └── layout/             # AppShell、demo 横幅
├── lib/                    # 业务逻辑
│   ├── llm/                # LLM 客户端、schema、prompts
│   ├── geo/                # 评分、策略、diff、审计、来源地图、实验
│   ├── fetch/              # 防 SSRF 安全抓取
│   ├── security/           # 限流
│   ├── demo/               # 会话隔离、数据清理
│   ├── report/             # Markdown 报告生成
│   ├── db.ts               # Prisma 客户端单例
│   ├── env.ts              # Zod 校验环境变量
│   └── mock-data.ts        # Demo 模式稳定模拟数据
└── generated/prisma/       # Prisma 生成代码
```

---

## 安全与隐私

### 公开 Demo 防护
- **默认 Mock 模式：** 不消耗真实 LLM API 额度
- **限流：** 生成接口按 `RATE_LIMIT_PER_HOUR` 限制
- **输入长度限制：** `MAX_INPUT_CHARS` 防止 token 滥用
- **匿名会话隔离：** Demo 用户只看得到自己创建的项目
- **数据过期：** Demo 项目在 `DEMO_DATA_RETENTION_DAYS` 天后自动过期
- **清理需鉴权：** `CRON_SECRET` 保护清理接口

### 生产环境加固
- `.env` 和密钥通过 `.gitignore` 排除在 Git 之外
- API Key 绝不暴露给前端
- 错误响应隐藏堆栈、数据库凭证和内部路径
- URL 抓取使用 `safe-fetch` 阻止 SSRF（localhost、内网 IP、metadata 地址）
- 服务端日志不记录完整用户输入、完整 prompt 和原始 LLM 响应
- IP 地址以加盐哈希存储

### LLM 安全
- 所有 LLM 输出用 Zod schema 校验
- 超时控制（`LLM_TIMEOUT_MS`）防止挂起
- JSON 解析失败 → 优雅 mock 兜底
- 结果标注来源：`mock` | `live` | `fallback`

---

## GEO 评分模型

| 维度 | 衡量内容 |
|-----------|-----------------|
| **实体清晰度** | AI 引擎能否清晰识别你的品牌是什么？ |
| **答案覆盖度** | 你的内容是否回答了用户向 AI 提出的问题？ |
| **引用友好度** | 你的内容是否包含可引用的具体事实、数字、日期？ |
| **内容结构** | 内容是否便于 AI 提取（FAQ、列表、Schema）？ |
| **新鲜度信号** | 内容是否有日期、版本、更新标识？ |

---

## 为什么这是 GEO 项目

GEO Lens 不只是 AI 内容生成器。它实现了：
- **结构化评分模型** 衡量 AI 引用潜力
- **引用失败诊断** 连接症状 → 根因 → 修复方案
- **优化前后对比** 展示可衡量的 GEO 提升
- **策略库** 沉淀可复用的优化模式
- **来源地图分析** 识别 AI 引擎获取引用信号的渠道
- 自身提供 `/robots.txt`、`/sitemap.xml`、`/llms.txt` 作为 GEO 最佳实践

---

## 技术亮点

- **LLM JSON Schema 校验：** 所有 LLM 输出用 Zod 校验；失败时回退到 mock 数据
- **Mock 兜底系统：** 稳定 mock 数据支持无 API Key 完整演示
- **限流机制：** 内存限流器配合加盐 IP 哈希
- **双线部署：** Vercel + Neon 用于简历演示；Docker Compose + VPS 体现工程完整性
- **SSRF 防护：** URL 抓取阻止 localhost、私有 IP、metadata 端点
- **Demo 会话隔离：** 匿名用户数据隔离；自动清理防止污染

---

## 设计取舍

| 决策 | 理由 |
|----------|----------|
| 无用户认证 | MVP 面向简历演示；登录系统增加复杂度但不增加演示价值 |
| Mock 模式默认 | 防止公开 demo 的 API Key 被滥用；项目自包含 |
| PostgreSQL（不用 SQLite） | 生产部署需要；Neon 免费额度使其平价可用 |
| TypeScript 常量维护策略 | 简单、版本可控、无需数据库迁移 |
| Markdown 报告（不用 PDF） | 实现更快，对复制粘贴工作流更实用 |
| 不接真实搜索 API | 保持零成本；mock 数据足以展示概念 |

---

## 2 分钟面试讲解稿

> "GEO Lens 是我针对生成式引擎优化这个新兴领域构建的全栈 SaaS 原型。随着 ChatGPT、Perplexity 等 AI 问答引擎成为主要信息入口，传统 SEO 指标无法衡量品牌是否被 AI 生成的答案引用。
>
> 我设计了一个五维评分模型——实体清晰度、答案覆盖度、引用友好度、内容结构和新鲜度信号——并构建了从项目创建到 AI 模拟、引用失败诊断、结构化建议的完整分析流程。
>
> 技术栈使用 Next.js 16 App Router、Prisma 7 + PostgreSQL，以及兼容 OpenAI 的 LLM 调用层，支持 DeepSeek。我实现了 LLM JSON Schema 校验、优雅 mock 兜底、限流、SSRF 安全抓取和匿名会话隔离。
>
> 项目包含三个研究型功能——连接症状到根因的引用失败诊断、展示可衡量内容提升的优化前后对比、沉淀 9 条可复用模式的策略库。同时实现了轻量企业级模块：技术审计、Prompt 组合、来源地图和实验追踪。
>
> 项目支持两条部署路线：Vercel + Neon 用于零成本简历演示，Docker Compose + VPS 用于展示生产工程能力。配有 CI/CD、健康检查和全面的安全加固。"

---

## 简历描述

```
GEO Lens | 生成式引擎优化分析平台
• 使用 Next.js 16、TypeScript、Prisma、PostgreSQL 构建全栈 SaaS 原型
• 设计五维 GEO 评分模型，量化 AI 引用潜力
• 实现 LLM 服务层，含 Zod schema 校验、mock 兜底和限流
• 创建引用失败诊断、优化前后对比和策略库作为研究型差异化功能
• 增加 AI 就绪技术审计、Prompt 组合、引用来源地图和实验追踪
• 通过 Vercel + Neon（简历演示）和 Docker Compose + VPS（工程展示）双线部署
• 实现 demo 模式，含匿名会话隔离、数据过期清理和 SSRF 防护
```

---

## 截图

> 添加 3-5 张截图展示：
> 1. 项目仪表盘含 GEO 分数图表
> 2. AI 问答模拟结果
> 3. 引用失败诊断面板
> 4. 优化前后对比
> 5. 带筛选的策略库

*截图占位 — 自行添加或查看在线演示。*

---

## 开源协议

MIT — 详见 [LICENSE](./LICENSE)。

---

## 参与贡献

本项目为作品集项目。欢迎通过 GitHub Issues 提交 bug 报告和建议。

---

**在线演示：** [https://geo-lens.your-domain.com](https://geo-lens.your-domain.com)  
**GitHub：** [https://github.com/nebula167/geo-lens](https://github.com/nebula167/geo-lens)
