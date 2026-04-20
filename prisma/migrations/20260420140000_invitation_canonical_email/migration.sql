-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN "canonicalEmail" TEXT;

UPDATE "Invitation" SET "canonicalEmail" = lower(trim("email"));

UPDATE "Invitation"
SET "canonicalEmail" = regexp_replace("canonicalEmail", '@googlemail\.com$', '@gmail.com')
WHERE "canonicalEmail" LIKE '%@googlemail.com';

ALTER TABLE "Invitation" ALTER COLUMN "canonicalEmail" SET NOT NULL;

-- Replace composite primary key (orgId, email) -> (orgId, canonicalEmail)
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_pkey";

ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_pkey" PRIMARY KEY ("orgId", "canonicalEmail");

CREATE INDEX "Invitation_orgId_canonicalEmail_status_idx" ON "Invitation"("orgId", "canonicalEmail", "status");
