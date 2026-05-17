import { z } from "zod";

export const DimensionScoresSchema = z.object({
  entityClarity: z.number().int().min(0).max(100),
  answerCoverage: z.number().int().min(0).max(100),
  citationReadiness: z.number().int().min(0).max(100),
  contentStructure: z.number().int().min(0).max(100),
  freshnessSignal: z.number().int().min(0).max(100),
});

export const GeoAnalysisSchema = z.object({
  totalScore: z.number().int().min(0).max(100),
  scores: DimensionScoresSchema,
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  nextActions: z.array(z.string()),
});

export const SimulatedQuestionSchema = z.object({
  question: z.string(),
  intent: z.string(),
  simulatedAnswer: z.string(),
  brandMentioned: z.boolean(),
  mentionReason: z.string(),
  improvement: z.string(),
});

export const QuestionsResponseSchema = z.object({
  questions: z.array(SimulatedQuestionSchema),
});

export const RecommendationSchema = z.object({
  type: z.string(),
  title: z.string(),
  content: z.string(),
  priority: z.enum(["high", "medium", "low"]),
});

export const RecommendationsResponseSchema = z.object({
  recommendations: z.array(RecommendationSchema),
});

export const CitationFailureSchema = z.object({
  failureType: z.string(),
  severity: z.enum(["high", "medium", "low"]),
  evidence: z.string(),
  reason: z.string(),
  fix: z.string(),
  impactedDimension: z.string(),
  relatedQuestion: z.string().optional(),
});

export const CitationFailureResponseSchema = z.object({
  failures: z.array(CitationFailureSchema),
});

export const ContentDiffSchema = z.object({
  sourceLabel: z.string(),
  beforeContent: z.string(),
  afterContent: z.string(),
  changeSummary: z.array(z.string()),
  rationale: z.string(),
  impactedDimensions: z.array(z.string()),
  addedElements: z.array(z.string()),
});

export const ReadinessCheckSchema = z.object({
  key: z.string(),
  label: z.string(),
  status: z.enum(["pass", "warning", "fail"]),
  impact: z.string(),
  fix: z.string(),
  relatedStrategies: z.array(z.string()),
});

export const ReadinessAuditResponseSchema = z.object({
  totalScore: z.number().int().min(0).max(100),
  checks: z.array(ReadinessCheckSchema),
  summary: z.string(),
});

export const PromptPortfolioItemSchema = z.object({
  prompt: z.string(),
  intentType: z.string(),
  funnelStage: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  targetKeyword: z.string().optional(),
  expectedBrands: z.array(z.string()),
  demandScore: z.number().int().min(0).max(100),
});

export const PromptPortfolioResponseSchema = z.object({
  prompts: z.array(PromptPortfolioItemSchema),
});

export const CitationSourceSchema = z.object({
  category: z.string(),
  coverage: z.enum(["strong", "partial", "missing"]),
  influence: z.string(),
  gap: z.string(),
  recommendedStrategies: z.array(z.string()),
});

export const CitationSourceMapResponseSchema = z.object({
  sources: z.array(CitationSourceSchema),
});

export type GeoAnalysis = z.infer<typeof GeoAnalysisSchema>;
export type SimulatedQuestion = z.infer<typeof SimulatedQuestionSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type CitationFailure = z.infer<typeof CitationFailureSchema>;
export type ContentDiff = z.infer<typeof ContentDiffSchema>;
export type ReadinessAuditResult = z.infer<typeof ReadinessAuditResponseSchema>;
export type PromptPortfolioItem = z.infer<typeof PromptPortfolioItemSchema>;
export type CitationSourceItem = z.infer<typeof CitationSourceSchema>;
