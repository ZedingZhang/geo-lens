const BLOCKED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254",
  "metadata.google.internal",
];

const BLOCKED_PREFIXES = [
  "10.",
  "172.16.",
  "172.17.",
  "172.18.",
  "172.19.",
  "172.20.",
  "172.21.",
  "172.22.",
  "172.23.",
  "172.24.",
  "172.25.",
  "172.26.",
  "172.27.",
  "172.28.",
  "172.29.",
  "172.30.",
  "172.31.",
  "192.168.",
];

export class SafeFetchError extends Error {
  constructor(
    message: string,
    public code: "invalid_url" | "blocked" | "timeout" | "fetch_failed"
  ) {
    super(message);
    this.name = "SafeFetchError";
  }
}

export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isBlockedUrl(urlString: string): { blocked: boolean; reason?: string } {
  try {
    const url = new URL(urlString);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { blocked: true, reason: `Protocol ${url.protocol} is not allowed` };
    }

    const hostname = url.hostname.toLowerCase();

    if (BLOCKED_HOSTS.includes(hostname)) {
      return { blocked: true, reason: `Host ${hostname} is blocked` };
    }

    for (const prefix of BLOCKED_PREFIXES) {
      if (hostname.startsWith(prefix)) {
        return { blocked: true, reason: `Private network IP range is blocked` };
      }
    }

    if (hostname.match(/^169\.254\./)) {
      return { blocked: true, reason: "Link-local address is blocked" };
    }

    return { blocked: false };
  } catch {
    return { blocked: true, reason: "Invalid URL format" };
  }
}

export async function safeFetch(
  urlString: string,
  timeoutMs: number = 10000
): Promise<{ text: string; status: number }> {
  if (!isValidUrl(urlString)) {
    throw new SafeFetchError("Invalid URL", "invalid_url");
  }

  const check = isBlockedUrl(urlString);
  if (check.blocked) {
    throw new SafeFetchError(check.reason ?? "URL is blocked", "blocked");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(urlString, {
      signal: controller.signal,
      headers: {
        "User-Agent": "GEO-Lens/1.0 (AI Readiness Checker)",
        Accept: "text/html,application/xhtml+xml,text/plain",
      },
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    const text = await response.text();

    return {
      text: text.slice(0, 50000),
      status: response.status,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new SafeFetchError("Request timed out", "timeout");
    }
    throw new SafeFetchError(
      `Fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "fetch_failed"
    );
  }
}
