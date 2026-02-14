import {
  router,
  orgProcedure,
  adminProcedure,
  rateLimitMiddleware,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ErrorReportStatus } from "@prisma/client";

const errorIdSchema = z.uuid();
const createErrorReportSchema = z.object({
  procedureId: z.string().min(1, { message: "Is Required" }),
  errorReport: z.string().min(1, { message: "Is Required" }).max(1000),
});

export const errorsRouter = router({
  // Query: GET errors for an organization
  getErrors: orgProcedure
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

      const errors = await ctx.db.errorReport.findMany({
        where: {
          procedure: {
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
        },
        include: {
          procedure: {
            include: {
              category: true,
              team: {
                select: {
                  departmentId: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        data: errors.map((error) => ({
          createdBy: error.createdBy,
          id: error.id,
          procedureName: error.procedure.title,
          category: error.procedure.category?.name || "Uncategorized",
          status: error.status,
          body: error.body,
          createdAt: error.createdAt,
          procedureId: error.procedureId,
          teamId: error.procedure.teamId,
          departmentId: error.procedure.team.departmentId,
        })),
      };
    }),

  // Mutation: Create error report
  createErrorReport: orgProcedure
    .use(rateLimitMiddleware("error-report-create"))
    .input(createErrorReportSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.org) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found, reauthenticate your current session",
        });
      }

      const { procedureId, errorReport: errorBody } = input;

      const errorReport = await ctx.db.errorReport.create({
        data: {
          procedureId,
          createdBy: ctx?.user?.id ?? "",
          body: errorBody,
          status: "OPEN",
        },
      });

      return {
        data: errorReport,
        message: "Error report submitted successfully",
      };
    }),

  // Mutation: Update error status
  updateErrorStatus: adminProcedure
    .input(
      z.object({
        errorId: errorIdSchema,
        status: z.enum(["OPEN", "RESOLVED", "ARCHIVED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found, reauthenticate your current session",
        });
      }

      const error = await ctx.db.errorReport.findUnique({
        where: { id: input.errorId },
        include: {
          procedure: {
            include: {
              team: {
                include: {
                  department: {
                    select: { orgId: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Error report not found, select a valid error report",
        });
      }

      // Verify belongs to org
      if (error.procedure.team.department.orgId !== ctx.org!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You don't have access to this error report, or it no longer exists",
        });
      }

      await ctx.db.errorReport.update({
        where: { id: input.errorId },
        data: { status: input.status as ErrorReportStatus },
      });

      const statusLabel =
        input.status === "RESOLVED"
          ? "completed"
          : input.status === "ARCHIVED"
            ? "archived"
            : "updated";

      return {
        data: { errorId: input.errorId, status: input.status },
        message: `Error report ${statusLabel}`,
      };
    }),

  // Mutation: Delete error report
  deleteError: adminProcedure
    .use(rateLimitMiddleware("error-delete"))
    .input(
      z.object({
        errorId: errorIdSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found, reauthenticate your current session",
        });
      }

      const error = await ctx.db.errorReport.findUnique({
        where: { id: input.errorId },
        include: {
          procedure: {
            include: {
              team: {
                include: {
                  department: {
                    select: { orgId: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Error report not found, select a valid report",
        });
      }

      // Verify belongs to org
      if (error.procedure.team.department.orgId !== ctx.org!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You don't have access to this error report, or it no longer exists",
        });
      }

      await ctx.db.errorReport.delete({
        where: { id: input.errorId },
      });

      return {
        data: { errorId: input.errorId },
        message: "Error report deleted successfully",
      };
    }),
});
