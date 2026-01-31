/*
  Warnings:

  - You are about to drop the column `processId` on the `ErrorReport` table. All the data in the column will be lost.
  - The primary key for the `Favorite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `processId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `processId` on the `IngestionJob` table. All the data in the column will be lost.
  - You are about to drop the `Procedure` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcessChunk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcessVersion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `procedureId` to the `ErrorReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `procedureId` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `procedureId` to the `IngestionJob` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProcedureStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProcedureStyle" AS ENUM ('RAW', 'STEPS', 'FLOW', 'YESNO');

-- DropForeignKey
ALTER TABLE "ErrorReport" DROP CONSTRAINT "ErrorReport_processId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_processId_fkey";

-- DropForeignKey
ALTER TABLE "IngestionJob" DROP CONSTRAINT "IngestionJob_outputVersionId_fkey";

-- DropForeignKey
ALTER TABLE "IngestionJob" DROP CONSTRAINT "IngestionJob_processId_fkey";

-- DropForeignKey
ALTER TABLE "Procedure" DROP CONSTRAINT "Process_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Procedure" DROP CONSTRAINT "Process_pendingVersionId_fkey";

-- DropForeignKey
ALTER TABLE "Procedure" DROP CONSTRAINT "Process_publishedVersionId_fkey";

-- DropForeignKey
ALTER TABLE "Procedure" DROP CONSTRAINT "Process_teamId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessChunk" DROP CONSTRAINT "ProcessChunk_processId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessChunk" DROP CONSTRAINT "ProcessChunk_teamId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessVersion" DROP CONSTRAINT "ProcessVersion_processId_fkey";

-- DropIndex
DROP INDEX "ErrorReport_processId_status_createdAt_idx";

-- DropIndex
DROP INDEX "Favorite_processId_idx";

-- DropIndex
DROP INDEX "IngestionJob_processId_status_createdAt_idx";

-- AlterTable
ALTER TABLE "ErrorReport" DROP COLUMN "processId",
ADD COLUMN     "procedureId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_pkey",
DROP COLUMN "processId",
ADD COLUMN     "procedureId" TEXT NOT NULL,
ADD CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userId", "procedureId");

-- AlterTable
ALTER TABLE "IngestionJob" DROP COLUMN "processId",
ADD COLUMN     "procedureId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Procedure";

-- DropTable
DROP TABLE "ProcessChunk";

-- DropTable
DROP TABLE "ProcessVersion";

-- DropEnum
DROP TYPE "ProcessStatus";

-- DropEnum
DROP TYPE "ProcessStyle";

-- CreateTable
CREATE TABLE "Procedure" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "categoryId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pendingVersionId" TEXT,
    "publishedVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "style" "ProcedureStyle" NOT NULL,
    "status" "ProcedureStatus" NOT NULL,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureVersion" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentJSON" JSONB NOT NULL,
    "contentText" TEXT,
    "style" "ProcedureStyle" NOT NULL,

    CONSTRAINT "ProcedureVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureChunk" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "chunkText" TEXT NOT NULL,
    "embedding" vector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcedureChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Procedure_pendingVersionId_key" ON "Procedure"("pendingVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Procedure_publishedVersionId_key" ON "Procedure"("publishedVersionId");

-- CreateIndex
CREATE INDEX "Procedure_teamId_categoryId_idx" ON "Procedure"("teamId", "categoryId");

-- CreateIndex
CREATE INDEX "Procedure_teamId_title_idx" ON "Procedure"("teamId", "title");

-- CreateIndex
CREATE INDEX "Procedure_teamId_slug_idx" ON "Procedure"("teamId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Procedure_teamId_slug_key" ON "Procedure"("teamId", "slug");

-- CreateIndex
CREATE INDEX "ProcedureVersion_procedureId_createdAt_idx" ON "ProcedureVersion"("procedureId", "createdAt");

-- CreateIndex
CREATE INDEX "ProcedureChunk_teamId_procedureId_idx" ON "ProcedureChunk"("teamId", "procedureId");

-- CreateIndex
CREATE INDEX "ProcedureChunk_procedureId_chunkIndex_idx" ON "ProcedureChunk"("procedureId", "chunkIndex");

-- CreateIndex
CREATE INDEX "ErrorReport_procedureId_status_createdAt_idx" ON "ErrorReport"("procedureId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Favorite_procedureId_idx" ON "Favorite"("procedureId");

-- CreateIndex
CREATE INDEX "IngestionJob_procedureId_status_createdAt_idx" ON "IngestionJob"("procedureId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_pendingVersionId_fkey" FOREIGN KEY ("pendingVersionId") REFERENCES "ProcedureVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "ProcedureVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureVersion" ADD CONSTRAINT "ProcedureVersion_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureChunk" ADD CONSTRAINT "ProcedureChunk_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureChunk" ADD CONSTRAINT "ProcedureChunk_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorReport" ADD CONSTRAINT "ErrorReport_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngestionJob" ADD CONSTRAINT "IngestionJob_outputVersionId_fkey" FOREIGN KEY ("outputVersionId") REFERENCES "ProcedureVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngestionJob" ADD CONSTRAINT "IngestionJob_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
