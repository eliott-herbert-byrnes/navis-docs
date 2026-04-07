-- CreateEnum
CREATE TYPE "AuditExportJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "AuditExportJob" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "requestedByUserId" TEXT NOT NULL,
    "filtersJson" JSONB NOT NULL,
    "fileKey" TEXT,
    "error" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "AuditExportJobStatus" NOT NULL,

    CONSTRAINT "AuditExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditExportJob_orgId_status_createdAt_idx" ON "AuditExportJob"("orgId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "AuditExportJob_orgId_requestedByUserId_status_createdAt_idx" ON "AuditExportJob"("orgId", "requestedByUserId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "AuditExportJob" ADD CONSTRAINT "AuditExportJob_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditExportJob" ADD CONSTRAINT "AuditExportJob_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
