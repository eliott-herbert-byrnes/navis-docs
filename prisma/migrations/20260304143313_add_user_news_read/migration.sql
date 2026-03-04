-- CreateTable
CREATE TABLE "UserNewsRead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "newsPostId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserNewsRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserNewsRead_userId_idx" ON "UserNewsRead"("userId");

-- CreateIndex
CREATE INDEX "UserNewsRead_newsPostId_idx" ON "UserNewsRead"("newsPostId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNewsRead_userId_newsPostId_key" ON "UserNewsRead"("userId", "newsPostId");

-- AddForeignKey
ALTER TABLE "UserNewsRead" ADD CONSTRAINT "UserNewsRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNewsRead" ADD CONSTRAINT "UserNewsRead_newsPostId_fkey" FOREIGN KEY ("newsPostId") REFERENCES "NewsPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
