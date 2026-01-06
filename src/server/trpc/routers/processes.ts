import {
  router,
  orgProcedure,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const teamSchema = z.string().min(1, { message: "Team is required" });
const querySchema = z.string();
const processSchema = z.string();

export const processRouter = router({
  // Query: GET-list uncategorized processes
  list: orgProcedure
    .input(
      z.object({
        teamId: teamSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      const processes = await ctx.db.process.findMany({
        where: {
          teamId: input.teamId,
          categoryId: null,
          status: "PUBLISHED",
        },
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
        },
        orderBy: {
          title: "asc",
        },
      });
      return { data: processes };
    }),

  // Query: GET-categories with processes
  categoriesWithProcesses: orgProcedure
    .input(
      z.object({
        teamId: teamSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      const categories = await ctx.db.category.findMany({
        where: { teamId: input.teamId },
        select: {
          id: true,
          name: true,
          sortOrder: true,
          processes: {
            where: {
              status: "PUBLISHED",
            },
            select: {
              id: true,
              slug: true,
              title: true,
              status: true,
            },
            orderBy: {
              title: "asc",
            },
          },
        },
        orderBy: {
          sortOrder: "asc",
        },
      });
      return { data: categories };
    }),

  // Query: GET-categories-with-count
  categoriesWithCount: orgProcedure
    .input(
      z.object({
        teamId: teamSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      const [categories, count] = await ctx.db.$transaction([
        ctx.db.category.findMany({
          where: { teamId: input.teamId },
          select: { id: true, name: true, sortOrder: true },
          orderBy: { sortOrder: "asc" },
        }),
        ctx.db.category.count({
          where: { teamId: input.teamId },
        }),
      ]);
      return { data: categories, metadata: { count } };
    }),

  // Query: GET-Individual process for edit
  getForEdit: orgProcedure
    .input(
      z.object({
        processId: processSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      const process = await ctx.db.process.findUnique({
        where: { id: input.processId },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          pendingVersion: {
            select: {
              id: true,
              contentJSON: true,
              style: true,
              createdAt: true,
            },
          },
          publishedVersion: {
            select: {
              id: true,
              contentJSON: true,
              style: true,
              createdAt: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!process) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Process not found",
        });
      }

      return {
        data: process,
      };
    }),

  // Query: GET-process for view with favorite status
  getForView: orgProcedure
    .input(
      z.object({
        processId: processSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      const [process, favorite] = await ctx.db.$transaction([
        ctx.db.process.findUnique({
          where: { id: input.processId },
          include: {
            publishedVersion: true,
            team: true,
            category: true,
          },
        }),
        ctx.db.favorite.findUnique({
          where: {
            userId_processId: {
              userId: ctx.user!.id ?? "",
              processId: input.processId,
            },
          },
          select: { userId: true },
        }),
      ]);

      if (!process) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Process not found",
        });
      }

      return {
        data: process,
        isFavorite: !!favorite,
      };
    }),

  // Query: GET-Search Processes
  searchProcesses: orgProcedure
    .input(
      z.object({
        teamId: teamSchema,
        query: querySchema,
      })
    )
    .query(async ({ ctx, input }) => {
      if (!input.query || input.query.length === 0) {
        return {data: []};
      }
      const processes = await ctx.db.process.findMany({
        where: {
          teamId: input.teamId,
          status: "PUBLISHED",
          title: {
            contains: input.query,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          categoryId: true,
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          title: "asc",
        },
        take: 10,
      });

      if (!process) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Error searching processes",
        });
      }

      return { data: processes };
    }),
});
