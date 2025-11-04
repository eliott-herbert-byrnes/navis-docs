-- AddForeignKey
ALTER TABLE "public"."ErrorReport" ADD CONSTRAINT "ErrorReport_processId_fkey" FOREIGN KEY ("processId") REFERENCES "public"."Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;
