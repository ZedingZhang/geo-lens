-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "description" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "competitors" TEXT,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "demoSessionHash" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "entityClarity" INTEGER NOT NULL,
    "answerCoverage" INTEGER NOT NULL,
    "citationReadiness" INTEGER NOT NULL,
    "contentStructure" INTEGER NOT NULL,
    "freshnessSignal" INTEGER NOT NULL,
    "strengths" TEXT NOT NULL,
    "weaknesses" TEXT NOT NULL,
    "nextActions" TEXT NOT NULL,
    "rawJson" TEXT,
    "resultSource" TEXT NOT NULL DEFAULT 'mock',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulatedQuestion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "simulatedAnswer" TEXT NOT NULL,
    "brandMentioned" BOOLEAN NOT NULL,
    "mentionReason" TEXT NOT NULL,
    "improvement" TEXT NOT NULL,
    "resultSource" TEXT NOT NULL DEFAULT 'mock',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimulatedQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "resultSource" TEXT NOT NULL DEFAULT 'mock',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CitationFailure" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "failureType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "fix" TEXT NOT NULL,
    "impactedDimension" TEXT NOT NULL,
    "relatedQuestionId" TEXT,
    "resultSource" TEXT NOT NULL DEFAULT 'mock',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CitationFailure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentDiff" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "beforeContent" TEXT NOT NULL,
    "afterContent" TEXT NOT NULL,
    "changeSummary" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "impactedDimensions" TEXT NOT NULL,
    "addedElements" TEXT NOT NULL,
    "resultSource" TEXT NOT NULL DEFAULT 'mock',
    "recommendationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentDiff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadinessAudit" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "checks" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "rawJson" TEXT,
    "resultSource" TEXT NOT NULL DEFAULT 'mock',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadinessAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "intentType" TEXT NOT NULL,
    "funnelStage" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "targetKeyword" TEXT,
    "expectedBrands" TEXT NOT NULL,
    "demandScore" INTEGER NOT NULL,
    "resultSource" TEXT NOT NULL DEFAULT 'mock',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CitationSource" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "coverage" TEXT NOT NULL,
    "influence" TEXT NOT NULL,
    "gap" TEXT NOT NULL,
    "recommendedStrategies" TEXT NOT NULL,
    "resultSource" TEXT NOT NULL DEFAULT 'mock',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CitationSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoExperiment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strategyId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "baselineScore" INTEGER,
    "afterScore" INTEGER,
    "delta" INTEGER,
    "impactedDimensions" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "GeoExperiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageEvent" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_isSample_idx" ON "Project"("isSample");

-- CreateIndex
CREATE INDEX "Project_demoSessionHash_idx" ON "Project"("demoSessionHash");

-- CreateIndex
CREATE INDEX "Project_expiresAt_idx" ON "Project"("expiresAt");

-- CreateIndex
CREATE INDEX "CitationFailure_projectId_idx" ON "CitationFailure"("projectId");

-- CreateIndex
CREATE INDEX "CitationFailure_failureType_idx" ON "CitationFailure"("failureType");

-- CreateIndex
CREATE INDEX "ContentDiff_projectId_idx" ON "ContentDiff"("projectId");

-- CreateIndex
CREATE INDEX "ReadinessAudit_projectId_idx" ON "ReadinessAudit"("projectId");

-- CreateIndex
CREATE INDEX "PromptItem_projectId_idx" ON "PromptItem"("projectId");

-- CreateIndex
CREATE INDEX "PromptItem_intentType_idx" ON "PromptItem"("intentType");

-- CreateIndex
CREATE INDEX "CitationSource_projectId_idx" ON "CitationSource"("projectId");

-- CreateIndex
CREATE INDEX "CitationSource_category_idx" ON "CitationSource"("category");

-- CreateIndex
CREATE INDEX "GeoExperiment_projectId_idx" ON "GeoExperiment"("projectId");

-- CreateIndex
CREATE INDEX "GeoExperiment_status_idx" ON "GeoExperiment"("status");

-- CreateIndex
CREATE INDEX "UsageEvent_ipHash_createdAt_idx" ON "UsageEvent"("ipHash", "createdAt");

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulatedQuestion" ADD CONSTRAINT "SimulatedQuestion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitationFailure" ADD CONSTRAINT "CitationFailure_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentDiff" ADD CONSTRAINT "ContentDiff_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadinessAudit" ADD CONSTRAINT "ReadinessAudit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptItem" ADD CONSTRAINT "PromptItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitationSource" ADD CONSTRAINT "CitationSource_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoExperiment" ADD CONSTRAINT "GeoExperiment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
