/*
  Warnings:

  - The `stripeSubscriptionStatus` column on the `Organization` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."StripeSubscriptionStatus" AS ENUM ('active', 'incomplete', 'incomplete_expired', 'past_due', 'canceled', 'unpaid', 'trialing', 'paused');

-- AlterTable
ALTER TABLE "public"."Organization" DROP COLUMN "stripeSubscriptionStatus",
ADD COLUMN     "stripeSubscriptionStatus" "public"."StripeSubscriptionStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeCustomerId_key" ON "public"."Organization"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeSubscriptionId_key" ON "public"."Organization"("stripeSubscriptionId");
