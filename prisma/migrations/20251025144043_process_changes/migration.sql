/*
  Warnings:

  - A unique constraint covering the columns `[pendingVersionId]` on the table `Procedure` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publishedVersionId]` on the table `Procedure` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Process_pendingVersionId_key" ON "public"."Procedure"("pendingVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Process_publishedVersionId_key" ON "public"."Procedure"("publishedVersionId");

-- CreateIndex
CREATE INDEX "ProcessVersion_processId_createdAt_idx" ON "public"."ProcessVersion"("processId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Procedure" ADD CONSTRAINT "Process_pendingVersionId_fkey" FOREIGN KEY ("pendingVersionId") REFERENCES "public"."ProcessVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Procedure" ADD CONSTRAINT "Process_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "public"."ProcessVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProcessVersion" ADD CONSTRAINT "ProcessVersion_processId_fkey" FOREIGN KEY ("processId") REFERENCES "public"."Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
