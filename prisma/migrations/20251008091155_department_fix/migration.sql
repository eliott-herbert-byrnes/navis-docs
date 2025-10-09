-- DropForeignKey
ALTER TABLE "public"."Department" DROP CONSTRAINT "Department_orgId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Department" ADD CONSTRAINT "Department_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
