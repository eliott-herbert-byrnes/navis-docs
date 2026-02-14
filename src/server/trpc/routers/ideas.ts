import {
  router,
  orgProcedure,
  adminProcedure,
  rateLimitMiddleware,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { IdeaStatus } from "@prisma/client";

const teamSchema = z.string().min(1, { message: "Team is required" });
const ideaIdSchema = z.uuid();
const createIdeaSchema = z.object({
  teamId: z.string().min(1, { message: "Is Required" }),
  ideaBody: z.string().min(1, { message: "Is Required" }).max(1000),
  ideaTitle: z.string().min(1, { message: "Is Required" }).max(100),
});

export const ideasRouter = router({
  // Query: GET ideas for a team
  getIdeas: orgProcedure
    .input(
      z.object({
        teamId: teamSchema,
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found, reauthenticate your current session",
        });
      }

      const ideas = await ctx.db.idea.findMany({
        where: {
          teamId: input.teamId,
          ...(input.search
            ? {
                title: {
                  contains: input.search,
                  mode: "insensitive" as const,
                },
              }
            : {}),
        },
        include: {
          team: {
            select: {
              departmentId: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        data: ideas.map((idea) => ({
          createdBy: idea.createdBy,
          id: idea.id,
          title: idea.title,
          body: idea.body,
          status: idea.status,
          createdAt: idea.createdAt,
          teamId: idea.teamId,
          departmentId: idea.team.departmentId,
        })),
      };
    }),

  // Query: GET ideas for an organization
  getOrgIdeas: orgProcedure
    .input(
      z.object({
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.org) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found, reauthenticate your current session",
        });
      }

      const ideas = await ctx.db.idea.findMany({
        where: {
          team: {
            department: {
              orgId: ctx.org.id,
            },
          },
          ...(input.search
            ? {
                title: {
                  contains: input.search,
                  mode: "insensitive" as const,
                },
              }
            : {}),
        },
        include: {
          team: {
            select: {
              departmentId: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        data: ideas.map((idea) => ({
          createdBy: idea.createdBy,
          id: idea.id,
          title: idea.title,
          body: idea.body,
          status: idea.status,
          createdAt: idea.createdAt,
          teamId: idea.teamId,
          departmentId: idea.team.departmentId,
        })),
      };
    }),

  // Mutation: Create idea
  createIdea: orgProcedure
    .use(rateLimitMiddleware("idea-create"))
    .input(createIdeaSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.org) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found, reauthenticate your current session",
        });
      }

      const { teamId, ideaBody, ideaTitle } = input;

      const idea = await ctx.db.idea.create({
        data: {
          title: ideaTitle,
          teamId,
          createdBy: ctx?.user?.id ?? "",
          body: ideaBody,
          status: "NEW",
        },
      });

      return {
        data: idea,
        message: "Idea submitted successfully",
      };
    }),

  // Mutation: Update idea status
  updateIdeaStatus: adminProcedure
    .input(
      z.object({
        ideaId: ideaIdSchema,
        status: z.enum(["NEW", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found, reauthenticate your current session",
        });
      }

      const idea = await ctx.db.idea.findUnique({
        where: { id: input.ideaId },
        include: {
          team: {
            include: {
              department: {
                select: { orgId: true },
              },
            },
          },
        },
      });

      if (!idea || idea.team.department.orgId !== ctx.org!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Idea not found, select a valid idea",
        });
      }

      await ctx.db.idea.update({
        where: { id: input.ideaId },
        data: { status: input.status as IdeaStatus },
      });

      const statusLabel =
        input.status === "COMPLETED"
          ? "completed"
          : input.status === "ARCHIVED"
            ? "archived"
            : "updated";

      return {
        data: { ideaId: input.ideaId, status: input.status },
        message: `Idea ${statusLabel}`,
      };
    }),

  // Mutation: Delete idea
  deleteIdea: adminProcedure
    .use(rateLimitMiddleware("idea-delete"))
    .input(
      z.object({
        ideaId: ideaIdSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found, reauthenticate your current session",
        });
      }

      const idea = await ctx.db.idea.findUnique({
        where: { id: input.ideaId },
        include: {
          team: {
            include: {
              department: {
                select: { orgId: true },
              },
            },
          },
        },
      });

      if (!idea || idea.team.department.orgId !== ctx.org!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Idea not found, select a valid idea",
        });
      }

      await ctx.db.idea.delete({
        where: { id: input.ideaId },
      });

      return {
        data: { ideaId: input.ideaId },
        message: "Idea deleted successfully",
      };
    }),
});
