import { parseJsonField } from "@/lib/utils";

export type BrandAmbiguityRisk = "High" | "Medium" | "Low";
export type BrandAmbiguitySeverity = "high" | "medium" | "low";

export interface BrandAmbiguitySignal {
  type:
    | "known_collision"
    | "acronym_overlap"
    | "semantic_overlap"
    | "generic_token"
    | "entity_definition";
  severity: BrandAmbiguitySeverity;
  label: string;
  evidence: string;
}

export interface BrandAmbiguityChecklistItem {
  field: string;
  status: "ok" | "weak" | "missing";
  action: string;
}

export interface BrandAmbiguityResult {
  resultSource: "rules";
  brandName: string;
  normalizedName: string;
  ambiguityRisk: BrandAmbiguityRisk;
  riskScore: number;
  possibleAmbiguities: string[];
  reason: string;
  recommendation: string;
  signals: BrandAmbiguitySignal[];
  checklist: BrandAmbiguityChecklistItem[];
}

export interface BrandAmbiguityInput {
  brandName: string;
  websiteUrl?: string | null;
  description?: string | null;
  product?: string | null;
  keywords?: string[] | string | null;
  competitors?: string[] | string | null;
}

const GENERIC_NAME_TOKENS = new Set([
  "ai",
  "app",
  "atlas",
  "cloud",
  "data",
  "flow",
  "forge",
  "geo",
  "lab",
  "labs",
  "lens",
  "logic",
  "nova",
  "pilot",
  "pulse",
  "search",
  "studio",
  "sync",
]);

export function buildBrandAmbiguityResult(
  input: BrandAmbiguityInput
): BrandAmbiguityResult {
  const brandName = input.brandName.trim() || "Unnamed brand";
  const normalizedName = normalizeBrandName(brandName);

  if (normalizedName === "geolens") {
    return buildGeoLensAmbiguity(input, brandName);
  }

  const keywords = toArray(input.keywords);
  const description = input.description || "";
  const product = input.product || keywords[0] || "target product";
  const tokens = tokenizeBrandName(brandName);
  const signals: BrandAmbiguitySignal[] = [];
  let riskScore = 20;

  const genericTokens = tokens.filter((token) => GENERIC_NAME_TOKENS.has(token));
  if (genericTokens.length > 0) {
    riskScore += genericTokens.length * 12;
    signals.push({
      type: "generic_token",
      severity: genericTokens.length >= 2 ? "high" : "medium",
      label: "Generic naming tokens",
      evidence: `The name contains broad terms: ${genericTokens.join(", ")}.`,
    });
  }

  if (hasLikelyAcronym(brandName)) {
    riskScore += 14;
    signals.push({
      type: "acronym_overlap",
      severity: "medium",
      label: "Acronym overlap",
      evidence:
        "Short uppercase tokens often collide with industry acronyms, people, projects, or locations.",
    });
  }

  if (!hasEntityDefinition(description)) {
    riskScore += 12;
    signals.push({
      type: "entity_definition",
      severity: "medium",
      label: "Weak entity definition",
      evidence:
        "The available project description does not contain a direct extractable entity definition.",
    });
  }

  if (!input.websiteUrl) {
    riskScore += 8;
    signals.push({
      type: "semantic_overlap",
      severity: "low",
      label: "No canonical URL",
      evidence:
        "Without a canonical public page, AI systems have fewer signals to disambiguate the entity.",
    });
  }

  riskScore = clamp(riskScore, 0, 100);
  const ambiguityRisk = riskFromScore(riskScore);
  const compactName = compactBrandName(brandName);
  const possibleAmbiguities = [
    `${brandName} as ${product}`,
    `${compactName} as an unrelated software, media, research, or community project`,
    `${brandName} as a person, organization, or location name in another context`,
  ];

  return {
    resultSource: "rules",
    brandName,
    normalizedName,
    ambiguityRisk,
    riskScore,
    possibleAmbiguities,
    reason: reasonForRisk(brandName, ambiguityRisk),
    recommendation: `Use "${brandName}" consistently with an expanded descriptor in title, H1, README, metadata, and schema. Add a one-sentence entity definition near the top of the homepage.`,
    signals,
    checklist: buildChecklist({
      brandName,
      hasExpandedPhrase: hasExpandedDescriptor(description, brandName, product),
      hasEntityDefinition: hasEntityDefinition(description),
      hasWebsite: Boolean(input.websiteUrl),
    }),
  };
}

function buildGeoLensAmbiguity(
  input: BrandAmbiguityInput,
  brandName: string
): BrandAmbiguityResult {
  const description = input.description || "";
  const product = input.product || "";
  const hasExpandedPhrase = /Generative Engine Optimization Lens/i.test(
    `${description} ${product}`
  );

  return {
    resultSource: "rules",
    brandName,
    normalizedName: "geolens",
    ambiguityRisk: "High",
    riskScore: 92,
    possibleAmbiguities: [
      "GEO Lens as Generative Engine Optimization tool",
      "GeoLens as geolocation / GIS / image privacy tools",
      "LibreGeoLens as QGIS MLLM plugin",
    ],
    reason:
      'The name "GeoLens" is already associated with geospatial, GIS, and image privacy projects.',
    recommendation:
      'Use "GEO Lens" consistently with the expanded phrase "Generative Engine Optimization Lens" in title, H1, README, metadata, and schema.',
    signals: [
      {
        type: "known_collision",
        severity: "high",
        label: "GeoLens collision",
        evidence:
          "GeoLens is a compact spelling that reads naturally as geolocation, geospatial, GIS, or image privacy tooling.",
      },
      {
        type: "acronym_overlap",
        severity: "high",
        label: "GEO meaning overlap",
        evidence:
          "GEO can mean Generative Engine Optimization, geography, geospatial, or geolocation.",
      },
      {
        type: "semantic_overlap",
        severity: "medium",
        label: "Adjacent project pattern",
        evidence:
          "LibreGeoLens-style naming creates an adjacent QGIS and MLLM interpretation for the same compact name.",
      },
    ],
    checklist: buildChecklist({
      brandName,
      hasExpandedPhrase,
      hasEntityDefinition: hasEntityDefinition(description),
      hasWebsite: Boolean(input.websiteUrl),
      expandedPhrase: "Generative Engine Optimization Lens",
    }),
  };
}

function buildChecklist(input: {
  brandName: string;
  hasExpandedPhrase: boolean;
  hasEntityDefinition: boolean;
  hasWebsite: boolean;
  expandedPhrase?: string;
}): BrandAmbiguityChecklistItem[] {
  const expandedPhrase =
    input.expandedPhrase || `${input.brandName} category descriptor`;

  return [
    {
      field: "title / H1",
      status: input.hasExpandedPhrase ? "ok" : "weak",
      action: `Pair "${input.brandName}" with "${expandedPhrase}" in the first screen.`,
    },
    {
      field: "entity definition",
      status: input.hasEntityDefinition ? "ok" : "missing",
      action:
        "Add a 40-word neutral definition that states entity type, audience, category, and use case.",
    },
    {
      field: "metadata / schema",
      status: input.hasExpandedPhrase ? "ok" : "weak",
      action:
        "Repeat the canonical name, expanded phrase, sameAs links, and product category in metadata and JSON-LD.",
    },
    {
      field: "canonical page",
      status: input.hasWebsite ? "ok" : "missing",
      action:
        "Publish one canonical public page that owns the brand spelling and category definition.",
    },
  ];
}

function reasonForRisk(
  brandName: string,
  ambiguityRisk: BrandAmbiguityRisk
): string {
  if (ambiguityRisk === "High") {
    return `The name "${brandName}" uses overloaded or generic terms that can map to unrelated products, people, projects, or categories.`;
  }

  if (ambiguityRisk === "Medium") {
    return `The name "${brandName}" has some generic naming signals and should be reinforced with a clear category descriptor.`;
  }

  return `The name "${brandName}" has limited ambiguity signals, but should still use a stable entity definition.`;
}

function riskFromScore(score: number): BrandAmbiguityRisk {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function normalizeBrandName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function compactBrandName(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "") || value;
}

function tokenizeBrandName(value: string): string[] {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function hasLikelyAcronym(value: string): boolean {
  return /\b[A-Z]{2,5}\b/.test(value);
}

function hasEntityDefinition(description: string): boolean {
  return /\bis a\b|\bis an\b|\bplatform\b|\btool\b|\bservice\b|\bsoftware\b|\bplugin\b|\bframework\b/i.test(
    description
  );
}

function hasExpandedDescriptor(
  description: string,
  brandName: string,
  product: string
): boolean {
  if (!description) return false;
  const escapedBrand = escapeRegExp(brandName);
  return (
    new RegExp(`${escapedBrand}.{0,80}${escapeRegExp(product)}`, "i").test(
      description
    ) ||
    (product.trim().length >= 8 &&
      new RegExp(escapeRegExp(product), "i").test(description))
  );
}

function toArray(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return parseJsonField<string[]>(value, []);
  return [];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
