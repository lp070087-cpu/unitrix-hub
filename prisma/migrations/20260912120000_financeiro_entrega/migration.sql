-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "chargeKey" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "stageChangedAt" TIMESTAMP(3),
ADD COLUMN     "totalValue" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BLOCKED',
    "link" TEXT,
    "files" JSONB,
    "credentials" JSONB,
    "documentation" TEXT,
    "notes" TEXT,
    "blockedReason" TEXT,
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_projectId_key" ON "Delivery"("projectId");

-- CreateIndex
CREATE INDEX "Payment_clientId_status_idx" ON "Payment"("clientId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_projectId_chargeKey_key" ON "Payment"("projectId", "chargeKey");

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
