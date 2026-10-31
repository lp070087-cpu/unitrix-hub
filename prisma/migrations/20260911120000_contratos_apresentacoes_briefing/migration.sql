-- AlterTable
ALTER TABLE "Presentation" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "contentSnapshot" JSONB,
ADD COLUMN     "deliveryPeriod" TEXT,
ADD COLUMN     "previousVersionId" TEXT,
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "signatureHash" TEXT,
ADD COLUMN     "signatureUserAgent" TEXT,
ADD COLUMN     "supersededAt" TIMESTAMP(3),
ADD COLUMN     "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "viewedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Briefing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "projectKind" TEXT,
    "niche" TEXT,
    "companyName" TEXT,
    "mainGoal" TEXT,
    "targetAudience" TEXT,
    "productsServices" TEXT,
    "references" TEXT,
    "competitors" TEXT,
    "desiredFeatures" TEXT,
    "visualStyle" TEXT,
    "preferredColors" TEXT,
    "avoidedColors" TEXT,
    "hasLogo" BOOLEAN,
    "domain" TEXT,
    "hosting" TEXT,
    "integrations" TEXT,
    "needsAi" BOOLEAN,
    "aiNeeds" TEXT,
    "notes" TEXT,
    "additionalInfo" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "revisionNote" TEXT,
    "revisionRequestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "Briefing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BriefingFile" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'OTHER',
    "label" TEXT NOT NULL,
    "externalUrl" TEXT,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "briefingId" TEXT NOT NULL,

    CONSTRAINT "BriefingFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Briefing_projectId_key" ON "Briefing"("projectId");

-- CreateIndex
CREATE INDEX "Briefing_clientId_idx" ON "Briefing"("clientId");

-- CreateIndex
CREATE INDEX "Briefing_status_idx" ON "Briefing"("status");

-- CreateIndex
CREATE INDEX "BriefingFile_briefingId_idx" ON "BriefingFile"("briefingId");

-- CreateIndex
CREATE INDEX "Presentation_clientId_idx" ON "Presentation"("clientId");

-- CreateIndex
CREATE INDEX "Presentation_projectId_idx" ON "Presentation"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_previousVersionId_key" ON "Contract"("previousVersionId");

-- AddForeignKey
ALTER TABLE "Presentation" ADD CONSTRAINT "Presentation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_previousVersionId_fkey" FOREIGN KEY ("previousVersionId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Briefing" ADD CONSTRAINT "Briefing_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Briefing" ADD CONSTRAINT "Briefing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefingFile" ADD CONSTRAINT "BriefingFile_briefingId_fkey" FOREIGN KEY ("briefingId") REFERENCES "Briefing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
