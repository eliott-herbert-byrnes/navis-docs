-- CreateEnum
CREATE TYPE "OrgPlan" AS ENUM ('pro', 'enterprise');

-- Migrate legacy string values before converting column type
UPDATE "Organization" SET "plan" = 'pro' WHERE "plan" = 'business';

-- Convert plan from TEXT to OrgPlan
ALTER TABLE "Organization" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Organization" ALTER COLUMN "plan" TYPE "OrgPlan" USING ("plan"::text::"OrgPlan");
ALTER TABLE "Organization" ALTER COLUMN "plan" SET DEFAULT 'pro'::"OrgPlan";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "anthropicApiKey" TEXT,
ADD COLUMN "openAiApiKey" TEXT;
