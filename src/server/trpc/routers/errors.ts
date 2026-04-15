import {
  router,
  orgProcedure,
  orgActiveProcedure,
  orgAdminActiveProcedure,
  rateLimitMiddleware,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ErrorReportStatus } from "@prisma/client";
import { revalidateTag } from "next/cache";

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
  createErrorReport: orgActiveProcedure
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

      revalidateTag(`org-dashboard-${ctx?.org?.id}`, 'max');

      return {
        data: errorReport,
        message: "Error report submitted successfully",
      };
    }),

  // Mutation: Update error status
  updateErrorStatus: orgAdminActiveProcedure
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


      revalidateTag(`org-dashboard-${ctx?.org?.id}`, 'max');
      
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
  deleteError: orgAdminActiveProcedure
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

      revalidateTag(`org-dashboard-${ctx.org!.id}`, 'max');

      return {
        data: { errorId: input.errorId },
        message: "Error report deleted successfully",
      };
    }),

  deleteErrors: orgAdminActiveProcedure
    .use(rateLimitMiddleware("error-delete"))
    .input(
      z.object({
        errorIds: z.array(errorIdSchema).min(1).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.org) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found, reauthenticate your current session",
        });
      }

      const errors = await ctx.db.errorReport.findMany({
        where: {
          id: { in: input.errorIds },
          procedure: {
            team: {
              department: {
                orgId: ctx.org.id,
              },
            },
          },
        },
        select: { id: true },
      });

      if (errors.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No error reports found, select valid reports",
        });
      }

      const idsToDelete = errors.map((e) => e.id);
      await ctx.db.errorReport.deleteMany({
        where: { id: { in: idsToDelete } },
      });

      revalidateTag(`org-dashboard-${ctx?.org?.id}`, 'max');

      return {
        data: { deletedCount: errors.length },
        message:
          errors.length === 1
            ? "Error report deleted successfully"
            : `${errors.length} error reports deleted successfully`,
      };
    }),
});
