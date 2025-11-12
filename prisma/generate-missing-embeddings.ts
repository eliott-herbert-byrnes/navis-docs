import { PrismaClient, ProcessStatus } from '@prisma/client';
import { generateEmbedding } from '../src/lib/ai/embeddings';
import { chunkProcessContent } from '../src/features/ai/utils/chunk-content';

const prisma = new PrismaClient();

async function generateProcessEmbeddings(processId: string) {
  const process = await prisma.process.findUnique({
    where: { id: processId },
    include: {
      publishedVersion: true,
    },
  });

  if (!process?.publishedVersion?.contentText) {
    console.log(`⚠️  Skipping ${process?.title || processId} - no published content`);
    return;
  }

  // Delete any existing chunks
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
      console.error(`❌ Failed embedding for ${process.title}, chunk ${chunk.chunkIndex}:`, error);
      throw error;
    }
  }

  console.log(`✅ Generated ${chunks.length} chunks for: ${process.title}`);
}

async function main() {
  console.log('🔍 Finding published processes without embeddings...\n');
  
  const publishedProcesses = await prisma.process.findMany({
    where: {
      status: ProcessStatus.PUBLISHED,
      publishedVersion: {
        isNot: null,
      },
    },
    include: {
      publishedVersion: true,
    },
  });

  console.log(`Found ${publishedProcesses.length} published processes\n`);

  for (const process of publishedProcesses) {
    try {
      await generateProcessEmbeddings(process.id);
    } catch (error) {
      console.error(`Failed to process ${process.title}:`, error);
      // Continue with other processes
    }
  }

  const chunkCount = await prisma.processChunk.count();
  console.log(`\n✨ Complete! Total chunks in database: ${chunkCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });