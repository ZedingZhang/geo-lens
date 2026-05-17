import { getEnv } from "@/lib/env";

export default function SettingsPage() {
  let env;
  try {
    env = getEnv();
  } catch {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="card p-6 text-center text-[var(--muted-foreground)]">
          Environment not configured. Check your .env file.
        </div>
      </div>
    );
  }

  const settings = [
    { label: "LLM Model", value: env.LLM_MODEL },
    { label: "LLM Base URL", value: env.LLM_BASE_URL },
    { label: "LLM API Key", value: env.LLM_API_KEY ? "Configured ✓" : "Not configured (mock mode)" },
    { label: "Mode", value: env.DEMO_MODE ? "Demo Mode (mock LLM)" : "Live LLM Mode" },
    { label: "Rate Limit", value: `${env.RATE_LIMIT_PER_HOUR} requests/hour` },
    { label: "Max Input Length", value: `${env.MAX_INPUT_CHARS} characters` },
    { label: "Demo Projects Limit", value: `${env.MAX_PROJECTS_PER_DEMO_SESSION} per session` },
    { label: "Demo Data Retention", value: `${env.DEMO_DATA_RETENTION_DAYS} days` },
    { label: "App URL", value: env.NEXT_PUBLIC_APP_URL },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="card mb-6">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-sm">Environment Configuration</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            These settings are configured via environment variables. To change them, update your .env file.
          </p>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {settings.map(s => (
            <div key={s.label} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm">{s.label}</span>
              <span className="text-sm font-mono text-[var(--muted-foreground)]">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-semibold text-sm mb-2">About GEO Lens</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          GEO Lens is a Generative Engine Optimization platform that helps content teams and personal brands measure and improve their visibility in AI-powered search engines.
        </p>
        <div className="mt-3 text-xs text-[var(--muted-foreground)]">
          <p>Tech Stack: Next.js · TypeScript · Prisma · PostgreSQL · OpenAI-compatible API</p>
          <p className="mt-1">Open Source under MIT License</p>
        </div>
      </div>
    </div>
  );
}
