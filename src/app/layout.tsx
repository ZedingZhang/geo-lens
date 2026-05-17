import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AppShell } from "@/components/layout/app-shell";
import { DemoBanner } from "@/components/layout/demo-banner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GEO Lens — Generative Engine Optimization Platform",
    template: "%s | GEO Lens",
  },
  description:
    "GEO Lens helps content teams and personal brands measure and improve their visibility in AI-powered search engines. Get a GEO score, find citation gaps, and generate optimized content.",
  openGraph: {
    title: "GEO Lens — Generative Engine Optimization Platform",
    description:
      "Measure and improve your AI search visibility with GEO scoring, citation failure diagnosis, and actionable content optimization.",
    type: "website",
    siteName: "GEO Lens",
  },
  twitter: {
    card: "summary_large_image",
    title: "GEO Lens — Generative Engine Optimization Platform",
    description:
      "Measure and improve your AI search visibility with GEO scoring, citation failure diagnosis, and actionable content optimization.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)] antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DemoBanner />
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
