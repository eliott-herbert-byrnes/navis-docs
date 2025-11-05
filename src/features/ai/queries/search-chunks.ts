"use server";

import { generateEmbedding } from "@/lib/ai/embeddings";
import { prisma } from "@/lib/prisma";

export interface ChunkResult {
    id: string;
    processId: string;
    teamId: string;
    title: string;
    chunkText: string;
    similarity: number;
}

export async function searchProcessChunks(
    query: string,
    teamId: string,
    limit: number = 5
): Promise<ChunkResult[]> {
    const queryEmbedding = await generateEmbedding(query);

    const queryEmbeddingString = `[${queryEmbedding.join(",")}]`;

    const results = await prisma.$queryRaw<Array<{
        id: string;
        processId: string;
        teamId: string;
        title: string;
        chunkText: string;
        similarity: number;
    }>>`
        SELECT * FROM match_process_chunks(
            ${queryEmbeddingString}::vector(1536),
            0.5::float,
            ${limit}::int,
            ${teamId}::text
        )
    `;

    return results;
}