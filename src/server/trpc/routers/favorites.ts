import { router, orgProcedure, rateLimitMiddleware } from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const teamSchema = z.string().min(1, { message: "Team is required" });
const procedureIdSchema = z.uuid();

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
          procedure: {
            teamId: input.teamId,
            status: "PUBLISHED",
          },
        },
        include: {
          procedure: {
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
          procedure: {
            title: "asc",
          },
        },
      });

      return { data: favorites.map((fav) => fav.procedure) };
    }),

  // Mutation: Toggle favorite
  toggleFavorite: orgProcedure
    .use(rateLimitMiddleware("favorite-toggle"))
    .input(
      z.object({
        procedureId: procedureIdSchema,
        isFavorited: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found, reauthenticate your current session",
        });
      }

      const procedure = await ctx.db.procedure.findFirst({
        where: {
          id: input.procedureId,
          team: {
            department: {
              orgId: ctx.org!.id,
            },
          },
        },
        select: { id: true, teamId: true, team: { select: { departmentId: true } } },
      });

      if (!procedure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Procedure not found, select a valid procedure",
        });
      }

      if (input.isFavorited) {
        // Remove favorite
        await ctx.db.favorite.deleteMany({
          where: {
            userId: ctx.user.id,
            procedureId: input.procedureId,
          },
        });
      } else {
        // Add favorite
        await ctx.db.favorite.upsert({
          where: {
            userId_procedureId: {
              userId: ctx?.user?.id ?? "",
              procedureId: input.procedureId,
            },
          },
          create: {
            userId: ctx?.user?.id ?? "",
            procedureId: input.procedureId,
          },
          update: {},
        });
      }

      revalidatePath(
        `/departments/${procedure.team.departmentId}/${procedure.teamId}/procedures`,
        "layout",
      );

      return {
        data: {
          procedureId: input.procedureId,
          isFavorited: !input.isFavorited,
        },
        message: input.isFavorited
          ? "Removed from favorites"
          : "Added to favorites",
      };
    }),
});
