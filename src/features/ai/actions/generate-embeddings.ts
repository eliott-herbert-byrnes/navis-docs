"use server";

import { prisma } from "@/lib/prisma";
import { chunkProcessContent } from "../utils/chunk-content";
import { generateEmbedding } from "@/lib/ai/embeddings";

export async function generateProcessEmbeddings(processId: string) {
  const process = await prisma.process.findUnique({
    where: { id: processId },
    include: {
      publishedVersion: true,
    },
  });

  if (!process?.publishedVersion?.contentText) {
    throw new Error("No published content to embed");
  }

  await prisma.processChunk.deleteMany({
    where: { processId },
  });

  const chunks = chunkProcessContent(process.publishedVersion.contentText);

  for (const chunk of chunks) {

    try {
    const embedding = await generateEmbedding(chunk.chunkText);

    const embeddingString = `[${embedding.join(",")}]`;

    await prisma.$executeRaw`
    INSERT INTO "ProcessChunk" (
        id, "processId", "teamId", title, "chunkIndex", "chunkText", embedding, "createdAt"
    ) VALUES (
        gen_random_uuid()::text,
        ${processId},
        ${process.teamId},
        ${process.title},
        ${chunk.chunkIndex},
        ${chunk.chunkText},
        ${embeddingString}::vector,
        NOW()
    )
    `;
        
    } catch (error) {
        console.error(`Failed to generate embedding for chunk ${chunk.chunkIndex}:`, error);
        throw error;
    }
  }

  console.log(`Generated ${chunks.length} chunks for process ${processId}`);
}
