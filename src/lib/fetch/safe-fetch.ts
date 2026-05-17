import { lookup } from "node:dns/promises";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254",
  "metadata.google.internal",
]);

const PRIVATE_IP_PREFIXES = [
  "10.",
  "172.16.", "172.17.", "172.18.", "172.19.",
  "172.20.", "172.21.", "172.22.", "172.23.",
  "172.24.", "172.25.", "172.26.", "172.27.",
  "172.28.", "172.29.", "172.30.", "172.31.",
  "192.168.",
  "127.",
  "0.",
];

function isPrivateIP(ip: string): boolean {
  if (ip === "::1" || ip === "169.254.169.254") return true;
  if (ip.startsWith("fe80:")) return true;
  for (const prefix of PRIVATE_IP_PREFIXES) {
    if (ip.startsWith(prefix)) return true;
  }
  if (ip.match(/^169\.254\./)) return true;
  return false;
}

export class SafeFetchError extends Error {
  constructor(
    message: string,
    public code: "invalid_url" | "blocked" | "dns_blocked" | "timeout" | "fetch_failed" | "redirect_blocked"
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

function validateUrl(urlString: string): URL {
  if (!isValidUrl(urlString)) {
    throw new SafeFetchError("Invalid URL", "invalid_url");
  }
  const url = new URL(urlString);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SafeFetchError(`Protocol ${url.protocol} not allowed`, "blocked");
  }
  const hostname = url.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new SafeFetchError(`Host ${hostname} is blocked`, "blocked");
  }
  // Check hostname directly for IP patterns
  if (isPrivateIP(hostname)) {
    throw new SafeFetchError("Private IP address is blocked", "blocked");
  }
  return url;
}

async function validateResolvedIP(hostname: string): Promise<void> {
  try {
    const addresses = await lookup(hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateIP(addr.address)) {
        throw new SafeFetchError(
          `DNS resolved to private IP: ${addr.address}`,
          "dns_blocked"
        );
      }
    }
  } catch (error) {
    if (error instanceof SafeFetchError) throw error;
    // DNS lookup failure — allow (will fail at fetch stage with clear error)
  }
}

export async function safeFetch(
  urlString: string,
  timeoutMs: number = 10000
): Promise<{ text: string; status: number }> {
  const url = validateUrl(urlString);
  await validateResolvedIP(url.hostname);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(urlString, {
      signal: controller.signal,
      headers: {
        "User-Agent": "GEO-Lens/1.0 (AI Readiness Checker)",
        Accept: "text/html,application/xhtml+xml,text/plain",
      },
      redirect: "manual",
    });

    clearTimeout(timeoutId);

    // Follow redirects manually, validating each target
    let currentResponse = response;
    let redirectCount = 0;
    const maxRedirects = 3;

    while (
      [301, 302, 303, 307, 308].includes(currentResponse.status) &&
      redirectCount < maxRedirects
    ) {
      const location = currentResponse.headers.get("location");
      if (!location) break;

      const redirectUrl = new URL(location, urlString);
      validateUrl(redirectUrl.href);
      await validateResolvedIP(redirectUrl.hostname);

      redirectCount++;
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), timeoutMs);
      currentResponse = await fetch(redirectUrl.href, {
        signal: ctrl.signal,
        headers: {
          "User-Agent": "GEO-Lens/1.0 (AI Readiness Checker)",
          Accept: "text/html,application/xhtml+xml,text/plain",
        },
        redirect: "manual",
      });
      clearTimeout(tid);
    }

    const text = await currentResponse.text();
    return {
      text: text.slice(0, 50000),
      status: currentResponse.status,
    };
  } catch (error) {
    if (error instanceof SafeFetchError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new SafeFetchError("Request timed out", "timeout");
    }
    throw new SafeFetchError(
      `Fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "fetch_failed"
    );
  }
}
