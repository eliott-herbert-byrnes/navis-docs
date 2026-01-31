-- AddForeignKey
ALTER TABLE "public"."ErrorReport" ADD CONSTRAINT "ErrorReport_processId_fkey" FOREIGN KEY ("processId") REFERENCES "public"."Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
