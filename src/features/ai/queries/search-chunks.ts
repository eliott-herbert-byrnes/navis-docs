"use server";

import { generateEmbedding } from "@/lib/ai/embeddings";
import { prisma } from "@/lib/prisma";

export async function getChunksByProcedureIds(
  procedureIds: string[],
  teamId: string,
): Promise<ChunkResult[]> {
  if (procedureIds.length === 0) return [];

  const chunks = await prisma.procedureChunk.findMany({
    where: {
      procedureId: { in: procedureIds },
      teamId,
    },
    orderBy: [{ procedureId: "asc" }, { chunkIndex: "asc" }],
  });

  return chunks.map((c) => ({
    id: c.id,
    procedureId: c.procedureId,
    teamId: c.teamId,
    title: c.title,
    chunkText: c.chunkText,
    similarity: 1,
  }));
}

export interface ChunkResult {
  id: string;
  procedureId: string;
  teamId: string;
  title: string;
  chunkText: string;
  similarity: number;
}

export async function searchProcedureChunks(
  query: string,
  teamId: string,
  limit: number = 5,
  threshold: number = 0.5,
): Promise<ChunkResult[]> {
  const queryEmbedding = await generateEmbedding(query);

  const queryEmbeddingString = `[${queryEmbedding.join(",")}]`;

  const results = await prisma.$queryRaw<
    Array<{
      id: string;
      procedureId: string;
      teamId: string;
      title: string;
      chunkText: string;
      similarity: number;
    }>
  >`
        SELECT * FROM match_procedure_chunks(
            ${queryEmbeddingString}::vector(1536),
            ${threshold}::float,
            ${limit}::int,
            ${teamId}::text
        )
    `;

  return results;
}
