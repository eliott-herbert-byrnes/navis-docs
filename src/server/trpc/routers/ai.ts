import { router, orgProcedure, rateLimitMiddleware } from "@/server/trpc/init";
import { assertTeamInOrg } from "@/server/trpc/org-scope";
import { z } from "zod";
import { assertAiEnabled } from "@/lib/ai/ai-enabled";
import { generateEmbedding } from "@/lib/ai/embeddings";

export interface ChunkResult {
  id: string;
  procedureId: string;
  teamId: string;
  title: string;
  chunkText: string;
  similarity: number;
}

export const aiRouter = router({
  // Query: Search procedure chunks with vector similarity
  searchChunks: orgProcedure
    .use(rateLimitMiddleware("ai-search"))
    .input(
      z.object({
        query: z.string().min(1, { message: "Query is required" }).max(280),
        teamId: z.string().min(1, { message: "Team ID is required" }),
        limit: z.number().min(1).max(50).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      assertAiEnabled();
      await assertTeamInOrg(ctx.db, input.teamId, ctx.org!.id);

      const queryEmbedding = await generateEmbedding(input.query);

      const queryEmbeddingString = `[${queryEmbedding.join(",")}]`;

      const results = await ctx.db.$queryRaw<ChunkResult[]>`
                SELECT * FROM match_procedure_chunks(
                    ${queryEmbeddingString}::vector(1536),
                    0.5::float,
                    ${input.limit}::int,
                    ${input.teamId}::text
                )
            `;

      return {
        data: results,
      };
    }),
});
