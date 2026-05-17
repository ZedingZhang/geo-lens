import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://geo-lens.vercel.app";
  const content = `User-agent: *
Allow: /

# AI Crawlers
User-agent: GPTBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
  return new NextResponse(content, {
    headers: { "Content-Type": "text/plain" },
  });
}
