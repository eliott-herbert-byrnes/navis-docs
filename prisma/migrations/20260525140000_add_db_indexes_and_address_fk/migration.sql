-- CreateIndex
CREATE INDEX "Address_orgId_idx" ON "Address"("orgId");

-- CreateIndex
CREATE INDEX "AuditLog_orgId_actorId_at_idx" ON "AuditLog"("orgId", "actorId", "at");

-- CreateIndex
CREATE INDEX "IngestionJob_outputVersionId_idx" ON "IngestionJob"("outputVersionId");

-- CreateIndex
CREATE INDEX "Organization_ownerUserId_idx" ON "Organization"("ownerUserId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
