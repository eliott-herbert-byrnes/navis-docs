-- CreateIndex
CREATE INDEX "AuditLog_orgId_entityType_entityId_at_idx" ON "AuditLog"("orgId", "entityType", "entityId", "at");
