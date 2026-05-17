export interface SourceMapCategory {
  key: string;
  label: string;
  description: string;
}

export const SOURCE_CATEGORIES: SourceMapCategory[] = [
  {
    key: "owned_site",
    label: "Owned Site",
    description: "Official website, blog, documentation pages.",
  },
  {
    key: "docs",
    label: "Docs & Help",
    description: "Product documentation, help center, knowledge base.",
  },
  {
    key: "third_party_articles",
    label: "Third-Party Articles",
    description: "Media coverage, guest posts, industry articles.",
  },
  {
    key: "reviews",
    label: "Reviews & Listings",
    description: "Review sites, directories, comparison platforms.",
  },
  {
    key: "community",
    label: "Community",
    description: "Reddit, forums, Stack Overflow, community discussions.",
  },
  {
    key: "video",
    label: "Video & Audio",
    description: "YouTube, podcasts, webinars, video content.",
  },
  {
    key: "comparison_pages",
    label: "Comparison Pages",
    description: "Competitor comparison pages, alternative-to pages.",
  },
  {
    key: "social_profiles",
    label: "Social Profiles",
    description: "LinkedIn, X/Twitter, GitHub, professional profiles.",
  },
];

export function getCoverageColor(coverage: string): string {
  switch (coverage) {
    case "strong":
      return "#22c55e";
    case "partial":
      return "#eab308";
    case "missing":
      return "#ef4444";
    default:
      return "#6b7280";
  }
}

export function getCoverageLabel(coverage: string): string {
  switch (coverage) {
    case "strong":
      return "Strong";
    case "partial":
      return "Partial";
    case "missing":
      return "Missing";
    default:
      return coverage;
  }
}
