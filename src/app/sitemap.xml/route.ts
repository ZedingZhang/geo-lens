import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://geo-lens.vercel.app";
  const pages = [
    { path: "", priority: "1.0" },
    { path: "/projects", priority: "0.9" },
    { path: "/projects/new", priority: "0.8" },
    { path: "/strategies", priority: "0.8" },
    { path: "/settings", priority: "0.5" },
  ];

  const urls = pages
    .map(
      (p) => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
