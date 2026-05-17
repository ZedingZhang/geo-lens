import { z } from "zod";

export const envSchema = z.object({
  LLM_API_KEY: z.string().optional().default(""),
  LLM_BASE_URL: z.string().default("https://api.deepseek.com"),
  LLM_MODEL: z.string().default("deepseek-v4-flash"),
  LLM_TIMEOUT_MS: z.coerce.number().default(30000),
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  DEMO_MODE: z.coerce.boolean().default(true),
  RATE_LIMIT_PER_HOUR: z.coerce.number().default(20),
  MAX_INPUT_CHARS: z.coerce.number().default(2000),
  MAX_PROJECTS_PER_DEMO_SESSION: z.coerce.number().default(5),
  DEMO_DATA_RETENTION_DAYS: z.coerce.number().default(7),
  CRON_SECRET: z.string().default("dev_secret_change_in_production"),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    _env = envSchema.parse({
      LLM_API_KEY: process.env.LLM_API_KEY,
      LLM_BASE_URL: process.env.LLM_BASE_URL,
      LLM_MODEL: process.env.LLM_MODEL,
      LLM_TIMEOUT_MS: process.env.LLM_TIMEOUT_MS,
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_URL: process.env.DIRECT_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      DEMO_MODE: process.env.DEMO_MODE,
      RATE_LIMIT_PER_HOUR: process.env.RATE_LIMIT_PER_HOUR,
      MAX_INPUT_CHARS: process.env.MAX_INPUT_CHARS,
      MAX_PROJECTS_PER_DEMO_SESSION: process.env.MAX_PROJECTS_PER_DEMO_SESSION,
      DEMO_DATA_RETENTION_DAYS: process.env.DEMO_DATA_RETENTION_DAYS,
      CRON_SECRET: process.env.CRON_SECRET,
    });
  }
  return _env;
}

export function isDemoMode(): boolean {
  return getEnv().DEMO_MODE;
}

export function hasLLMApiKey(): boolean {
  return !!getEnv().LLM_API_KEY;
}

export function shouldUseMock(): boolean {
  return !hasLLMApiKey() || isDemoMode();
}
