import { PrismaClient, ProcedureStatus } from "@prisma/client";
import { generateEmbedding } from "../src/lib/ai/embeddings";
import { chunkProcedureContent } from "../src/features/ai/utils/chunk-content";
import { JsonObject } from "@prisma/client/runtime/client";
import { generatePlainTextFromTiptap } from "@/features/procedures/utils/generate-plain-text-from-tiptap";
import { generateProcedureEmbeddings } from "@/features/ai/actions/generate-embeddings";

const prisma = new PrismaClient();

export async function generateProcessEmbeddings(procedureId: string) {
  const procedure = await prisma.procedure.findUnique({
    where: { id: procedureId },
    include: {
      publishedVersion: true,
    },
  });

  if (!procedure?.publishedVersion) {
    console.log(
      `Skipping ${procedure?.title || procedureId} - no published version`,
    );
    return;
  }

  const contentText = generatePlainTextFromTiptap(
    procedure.publishedVersion.contentJSON as JsonObject,
  );

  if (!contentText || contentText.trim().length === 0) {
    console.log(`Skipping ${procedure.title} - contentJSON produced no text`);
    return;
  }

  await prisma.procedureVersion.update({
    where: { id: procedure.publishedVersion.id },
    data: { contentText },
  });

  console.log(
    `Regenerated contentText for ${procedure.title}: ${contentText.length} chars`,
  );

  await prisma.procedureChunk.deleteMany({
    where: { procedureId },
  });

  const chunks = chunkProcedureContent(contentText);
  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk.chunkText);
      const embeddingString = `[${embedding.join(",")}]`;

      await prisma.$executeRaw`
        INSERT INTO "ProcedureChunk" (
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
        `Failed embedding for ${procedure.title}, chunk ${chunk.chunkIndex}:`,
        error,
      );
      throw error;
    }
  }

  console.log(`Generated ${chunks.length} chunks for: ${procedure.title}`);
}

async function main() {
  console.log("Finding published procedures without embeddings...\n");

  const publishedProcedures = await prisma.procedure.findMany({
    where: {
      status: ProcedureStatus.PUBLISHED,
      publishedVersion: {
        isNot: null,
      },
    },
    include: {
      publishedVersion: true,
    },
  });

  console.log(`Found ${publishedProcedures.length} published procedures\n`);

  for (const procedure of publishedProcedures) {
    try {
      await generateProcedureEmbeddings(procedure.id);
    } catch (error) {
      console.error(`Failed to procedure ${procedure.title}:`, error);
    }
  }

  const chunkCount = await prisma.procedureChunk.count();
  console.log(`\nComplete! Total chunks in database: ${chunkCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
