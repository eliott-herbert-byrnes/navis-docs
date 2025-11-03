-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "public"."Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_processId_idx" ON "public"."Favorite"("processId");

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_processId_fkey" FOREIGN KEY ("processId") REFERENCES "public"."Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;
