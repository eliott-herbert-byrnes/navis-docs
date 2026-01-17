import { router, orgProcedure, rateLimitMiddleware } from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const teamSchema = z.string().min(1, { message: "Team is required" });
const processIdSchema = z.uuid();

export const favoritesRouter = router({
  // Query: GET favorites for a team
  getFavorites: orgProcedure
    .input(
      z.object({
        teamId: teamSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      const favorites = await ctx.db.favorite.findMany({
        where: {
          userId: ctx.user.id,
          process: {
            teamId: input.teamId,
            status: "PUBLISHED",
          },
        },
        include: {
          process: {
            include: {
              category: {
                select: {
                  name: true,
                },
              },
              publishedVersion: {
                select: {
                  contentText: true,
                },
              },
            },
          },
        },
        orderBy: {
          process: {
            title: "asc",
          },
        },
      });

      return { data: favorites.map((fav) => fav.process) };
    }),

  // Mutation: Toggle favorite
  toggleFavorite: orgProcedure
    .use(rateLimitMiddleware("favorite-toggle"))
    .input(
      z.object({
        processId: processIdSchema,
        isFavorited: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      const process = await ctx.db.process.findUnique({
        where: { id: input.processId },
      });

      if (!process) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Process not found",
        });
      }

      if (input.isFavorited) {
        // Remove favorite
        await ctx.db.favorite.deleteMany({
          where: {
            userId: ctx.user.id,
            processId: input.processId,
          },
        });
      } else {
        // Add favorite
        await ctx.db.favorite.upsert({
          where: {
            userId_processId: {
              userId: ctx?.user?.id ?? "",
              processId: input.processId,
            },
          },
          create: {
            userId: ctx?.user?.id ?? "",
            processId: input.processId,
          },
          update: {},
        });
      }

      return {
        data: {
          processId: input.processId,
          isFavorited: !input.isFavorited,
        },
        message: input.isFavorited
          ? "Removed from favorites"
          : "Added to favorites",
      };
    }),
});
