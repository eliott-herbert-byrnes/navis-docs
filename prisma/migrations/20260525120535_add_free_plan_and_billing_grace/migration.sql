-- AlterEnum
ALTER TYPE "OrgPlan" ADD VALUE 'free';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "billingGraceEndsAt" TIMESTAMP(3);
