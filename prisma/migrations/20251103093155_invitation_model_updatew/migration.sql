/*
  Warnings:

  - The primary key for the `Invitation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Invitation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Invitation" DROP CONSTRAINT "Invitation_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Invitation_pkey" PRIMARY KEY ("orgId", "email");
