-- AlterTable
ALTER TABLE "User" ADD COLUMN "canonicalEmail" TEXT;

-- Backfill: lower(trim(email)), then googlemail.com -> gmail.com (matches app canonicalEmail)
UPDATE "User" SET "canonicalEmail" = lower(trim("email"));

UPDATE "User"
SET "canonicalEmail" = regexp_replace("canonicalEmail", '@googlemail\.com$', '@gmail.com')
WHERE "canonicalEmail" LIKE '%@googlemail.com';

ALTER TABLE "User" ALTER COLUMN "canonicalEmail" SET NOT NULL;

CREATE UNIQUE INDEX "User_canonicalEmail_key" ON "User"("canonicalEmail");
