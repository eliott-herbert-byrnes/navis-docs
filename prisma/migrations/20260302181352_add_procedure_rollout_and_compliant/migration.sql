-- CreateEnum
CREATE TYPE "RolloutType" AS ENUM ('NEW', 'EDIT');

-- CreateEnum
CREATE TYPE "RolloutRoleFilter" AS ENUM ('ALL_USERS', 'ADMINS_ONLY', 'MEMBERS_ONLY');

-- AlterTable
ALTER TABLE "OrgMembership" ADD COLUMN     "compliant" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Procedure" ADD COLUMN     "emailOnPublish" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailRoleFilter" "RolloutRoleFilter",
ADD COLUMN     "newsOnPublish" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyOnPublish" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyRoleFilter" "RolloutRoleFilter";

-- CreateTable
CREATE TABLE "ProcedureRollout" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "notifyRoleFilter" "RolloutRoleFilter" NOT NULL,
    "emailRoleFilter" "RolloutRoleFilter",
    "rolloutType" "RolloutType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "newsPostId" TEXT,

    CONSTRAINT "ProcedureRollout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProcedureRead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProcedureRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcedureRollout_orgId_procedureId_versionId_idx" ON "ProcedureRollout"("orgId", "procedureId", "versionId");

-- CreateIndex
CREATE INDEX "UserProcedureRead_userId_idx" ON "UserProcedureRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProcedureRead_userId_procedureId_versionId_key" ON "UserProcedureRead"("userId", "procedureId", "versionId");

-- AddForeignKey
ALTER TABLE "ProcedureRollout" ADD CONSTRAINT "ProcedureRollout_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureRollout" ADD CONSTRAINT "ProcedureRollout_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ProcedureVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureRollout" ADD CONSTRAINT "ProcedureRollout_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureRollout" ADD CONSTRAINT "ProcedureRollout_newsPostId_fkey" FOREIGN KEY ("newsPostId") REFERENCES "NewsPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProcedureRead" ADD CONSTRAINT "UserProcedureRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProcedureRead" ADD CONSTRAINT "UserProcedureRead_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProcedureRead" ADD CONSTRAINT "UserProcedureRead_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ProcedureVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
