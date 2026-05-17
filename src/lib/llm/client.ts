import { getEnv, shouldUseMock, hasLLMApiKey } from "@/lib/env";
import OpenAI from "openai";
import type { ZodSchema } from "zod";

export type ResultSource = "mock" | "live" | "fallback";

export interface LLMResult<T> {
  data: T;
  source: ResultSource;
}

function getClient(): OpenAI | null {
  if (!hasLLMApiKey()) return null;
  return new OpenAI({
    apiKey: getEnv().LLM_API_KEY,
    baseURL: getEnv().LLM_BASE_URL,
    timeout: getEnv().LLM_TIMEOUT_MS,
  });
}

function trimInput(input: string): string {
  const max = getEnv().MAX_INPUT_CHARS;
  if (input.length <= max) return input;
  return input.slice(0, max) + "\n... [truncated]";
}

export async function callLLM<T>(
  prompt: string,
  schema: ZodSchema<T>,
  mockData: T,
  systemPrompt: string = "You are a GEO analysis expert. Always respond with valid JSON."
): Promise<LLMResult<T>> {
  if (shouldUseMock() || !hasLLMApiKey()) {
    return { data: mockData, source: "mock" };
  }

  const client = getClient();
  if (!client) {
    return { data: mockData, source: "mock" };
  }

  const trimmedPrompt = trimInput(prompt);
  const timeoutMs = getEnv().LLM_TIMEOUT_MS;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await client.chat.completions.create(
      {
        model: getEnv().LLM_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: trimmedPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error("LLM returned empty response");
      return { data: mockData, source: "fallback" };
    }

    const parsed = JSON.parse(content);
    const validated = schema.safeParse(parsed);

    if (!validated.success) {
      console.error("LLM output validation failed:", validated.error.flatten());
      return { data: mockData, source: "fallback" };
    }

    return { data: validated.data, source: "live" };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("LLM request timed out after", timeoutMs, "ms");
    } else if (error instanceof OpenAI.APIError) {
      console.error("LLM API error:", error.status, error.message);
    } else {
      console.error("LLM call failed:", String(error));
    }
    return { data: mockData, source: "fallback" };
  }
}
