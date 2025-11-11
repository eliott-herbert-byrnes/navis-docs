-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "public"."ProcessChunk" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "chunkText" TEXT NOT NULL,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcessChunk_teamId_processId_idx" ON "public"."ProcessChunk"("teamId", "processId");

-- CreateIndex
CREATE INDEX "ProcessChunk_processId_chunkIndex_idx" ON "public"."ProcessChunk"("processId", "chunkIndex");

-- AddForeignKey
ALTER TABLE "public"."ProcessChunk" ADD CONSTRAINT "ProcessChunk_processId_fkey" FOREIGN KEY ("processId") REFERENCES "public"."Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProcessChunk" ADD CONSTRAINT "ProcessChunk_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateFunction for semantic search
CREATE OR REPLACE FUNCTION match_process_chunks(
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int,
  team_id text
)
RETURNS TABLE (
  id text,
  processId text,
  teamId text,
  title text,
  chunkText text,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.id,
    pc."processId",
    pc."teamId",
    pc.title,
    pc."chunkText",
    (1 - (pc.embedding <=> query_embedding)) as similarity
  FROM "ProcessChunk" pc
  WHERE pc."teamId" = team_id
    AND (1 - (pc.embedding <=> query_embedding)) > similarity_threshold
  ORDER BY pc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
