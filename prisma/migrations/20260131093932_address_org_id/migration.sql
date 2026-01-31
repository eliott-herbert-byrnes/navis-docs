/*
  Warnings:

  - Added the required column `orgId` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "orgId" TEXT NOT NULL;
