/*
  Warnings:

  - The `status` column on the `ErrorReport` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Idea` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[teamId,slug]` on the table `Process` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `status` on the `IngestionJob` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `OrgMembership` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `style` on the `Process` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Process` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `style` on the `ProcessVersion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "public"."OrgMembershipRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."ProcessStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ProcessStyle" AS ENUM ('RAW', 'STEPS', 'FLOW', 'YESNO');

-- CreateEnum
CREATE TYPE "public"."IdeaStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ErrorReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."IngestionJobStatus" AS ENUM ('QUEUED', 'PARSING', 'GENERATING', 'FAILED', 'READY');

-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NewsPost" DROP CONSTRAINT "NewsPost_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Process" DROP CONSTRAINT "Process_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProcessVersion" DROP CONSTRAINT "ProcessVersion_processId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Team" DROP CONSTRAINT "Team_departmentId_fkey";

-- AlterTable
ALTER TABLE "public"."ErrorReport" DROP COLUMN "status",
ADD COLUMN     "status" "public"."ErrorReportStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "public"."Idea" DROP COLUMN "status",
ADD COLUMN     "status" "public"."IdeaStatus" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "public"."IngestionJob" DROP COLUMN "status",
ADD COLUMN     "status" "public"."IngestionJobStatus" NOT NULL;

-- AlterTable
ALTER TABLE "public"."OrgMembership" DROP COLUMN "role",
ADD COLUMN     "role" "public"."OrgMembershipRole" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Process" DROP COLUMN "style",
ADD COLUMN     "style" "public"."ProcessStyle" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."ProcessStatus" NOT NULL;

-- AlterTable
ALTER TABLE "public"."ProcessVersion" DROP COLUMN "style",
ADD COLUMN     "style" "public"."ProcessStyle" NOT NULL;

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailOTP" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailOTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invitation" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "invitedByUserId" TEXT,
    "status" "public"."InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "EmailOTP_email_expiresAt_idx" ON "public"."EmailOTP"("email", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "public"."Invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "Invitation_orgId_email_status_idx" ON "public"."Invitation"("orgId", "email", "status");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Category_teamId_sortOrder_idx" ON "public"."Category"("teamId", "sortOrder");

-- CreateIndex
CREATE INDEX "Department_orgId_name_idx" ON "public"."Department"("orgId", "name");

-- CreateIndex
CREATE INDEX "ErrorReport_processId_status_createdAt_idx" ON "public"."ErrorReport"("processId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Idea_teamId_status_createdAt_idx" ON "public"."Idea"("teamId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "IngestionJob_orgId_status_createdAt_idx" ON "public"."IngestionJob"("orgId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "IngestionJob_processId_status_createdAt_idx" ON "public"."IngestionJob"("processId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "NewsPost_teamId_createdAt_idx" ON "public"."NewsPost"("teamId", "createdAt");

-- CreateIndex
CREATE INDEX "OrgMembership_userId_idx" ON "public"."OrgMembership"("userId");

-- CreateIndex
CREATE INDEX "Process_teamId_categoryId_idx" ON "public"."Process"("teamId", "categoryId");

-- CreateIndex
CREATE INDEX "Process_teamId_title_idx" ON "public"."Process"("teamId", "title");

-- CreateIndex
CREATE INDEX "Process_teamId_slug_idx" ON "public"."Process"("teamId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Process_teamId_slug_key" ON "public"."Process"("teamId", "slug");

-- CreateIndex
CREATE INDEX "Team_departmentId_name_idx" ON "public"."Team"("departmentId", "name");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Organization" ADD CONSTRAINT "Organization_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Process" ADD CONSTRAINT "Process_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NewsPost" ADD CONSTRAINT "NewsPost_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IngestionJob" ADD CONSTRAINT "IngestionJob_outputVersionId_fkey" FOREIGN KEY ("outputVersionId") REFERENCES "public"."ProcessVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IngestionJob" ADD CONSTRAINT "IngestionJob_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IngestionJob" ADD CONSTRAINT "IngestionJob_processId_fkey" FOREIGN KEY ("processId") REFERENCES "public"."Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;
