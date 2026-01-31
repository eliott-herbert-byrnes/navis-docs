"use server";

import { prisma } from "@/lib/prisma";
import { chunkProcedureContent } from "../utils/chunk-content";
import { generateEmbedding } from "@/lib/ai/embeddings";

export async function generateProcedureEmbeddings(procedureId: string) {
  const procedure = await prisma.procedure.findUnique({
    where: { id: procedureId },
    include: {
      publishedVersion: true,
    },
  });

  if (!procedure?.publishedVersion?.contentText) {
    throw new Error("No published content to embed");
  }

  await prisma.procedureChunk.deleteMany({
    where: { procedureId },
  });

  const chunks = chunkProcedureContent(procedure.publishedVersion.contentText);

  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk.chunkText);

      const embeddingString = `[${embedding.join(",")}]`;

      await prisma.$executeRaw`
    INSERT INTO "procedureChunk" (
        id, "procedureId", "teamId", title, "chunkIndex", "chunkText", embedding, "createdAt"
    ) VALUES (
        gen_random_uuid()::text,
        ${procedureId},
        ${procedure.teamId},
        ${procedure.title},
        ${chunk.chunkIndex},
        ${chunk.chunkText},
        ${embeddingString}::vector,
        NOW()
    )
    `;
    } catch (error) {
      console.error(
        `Failed to generate embedding for chunk ${chunk.chunkIndex}:`,
        error,
      );
      throw error;
    }
  }

  console.log(`Generated ${chunks.length} chunks for procedure ${procedureId}`);
}
