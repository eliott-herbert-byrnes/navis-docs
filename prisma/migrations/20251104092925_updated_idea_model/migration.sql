-- AddForeignKey
ALTER TABLE "public"."Idea" ADD CONSTRAINT "Idea_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
