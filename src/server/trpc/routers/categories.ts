import { createAuditLog } from "@/features/audit/utils/audit";
import {
  router,
  adminProcedure,
  rateLimitMiddleware,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const categoryIdSchema = z.string().uuid();

export const categoriesRouter = router({
  getCategoriesForList: adminProcedure
    .input(
      z.object({
        search: z.string().max(100).optional(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No organization found, reauthenticate your current session",
        });
      }

      const where = {
        team: {
          department: {
            orgId: ctx.org.id,
          },
        },
        ...(input.search?.trim()
          ? {
              name: {
                contains: input.search.trim(),
                mode: "insensitive" as const,
              },
            }
          : {}),
      };

      const [categories, total] = await Promise.all([
        ctx.db.category.findMany({
          where,
          select: {
            id: true,
            name: true,
            teamId: true,
            sortOrder: true,
            team: {
              select: {
                department: {
                  select: { name: true },
                },
              },
            },
            _count: {
              select: { procedures: true },
            },
          },
          orderBy: [
            { team: { department: { name: "asc" } } },
            { team: { name: "asc" } },
            { sortOrder: "asc" },
            { name: "asc" },
          ],
          take: input.limit,
          skip: input.offset,
        }),
        ctx.db.category.count({ where }),
      ]);

      const list = (categories ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        teamId: c.teamId,
        departmentName: c.team.department.name,
        procedureCount: c._count.procedures,
      }));

      return {
        categories: list,
        total,
        hasMore: input.offset + input.limit < total,
        currentPage: Math.floor(input.offset / input.limit) + 1,
        totalPages: Math.ceil(total / input.limit) || 1,
      };
    }),

  deleteCategory: adminProcedure
    .use(rateLimitMiddleware("category-delete"))
    .input(z.object({ categoryId: categoryIdSchema }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No organization found, reauthenticate your current session",
        });
      }

      const category = await ctx.db.category.findFirst({
        where: {
          id: input.categoryId,
          team: {
            department: {
              orgId: ctx.org.id,
            },
          },
        },
        select: { id: true, name: true, teamId: true },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found, select a valid category",
        });
      }

      await ctx.db.$transaction([
        ctx.db.procedure.updateMany({
          where: { categoryId: input.categoryId },
          data: { categoryId: null },
        }),
        ctx.db.category.delete({
          where: { id: input.categoryId },
        }),
      ]);

      await createAuditLog({
        orgId: ctx.org.id,
        actorId: ctx.user?.id ?? "",
        action: "CATEGORY_DELETED",
        entityType: "CATEGORY",
        entityId: category.id,
        beforeJSON: {
          id: category.id,
          name: category.name,
          teamId: category.teamId,
        },
      });

      return { data: { id: category.id } };
    }),

  deleteCategories: adminProcedure
    .use(rateLimitMiddleware("category-delete"))
    .input(
      z.object({
        categoryIds: z.array(categoryIdSchema).min(1).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No organization found, reauthenticate your current session",
        });
      }

      const categories = await ctx.db.category.findMany({
        where: {
          id: { in: input.categoryIds },
          team: {
            department: {
              orgId: ctx.org.id,
            },
          },
        },
        select: { id: true, name: true, teamId: true },
      });

      if (categories.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No categories found, select valid categories",
        });
      }

      const idsToDelete = categories.map((c) => c.id);

      await ctx.db.$transaction([
        ctx.db.procedure.updateMany({
          where: { categoryId: { in: idsToDelete } },
          data: { categoryId: null },
        }),
        ctx.db.category.deleteMany({
          where: { id: { in: idsToDelete } },
        }),
      ]);

      for (const category of categories) {
        await createAuditLog({
          orgId: ctx.org.id,
          actorId: ctx.user?.id ?? "",
          action: "CATEGORY_DELETED",
          entityType: "CATEGORY",
          entityId: category.id,
          beforeJSON: {
            id: category.id,
            name: category.name,
            teamId: category.teamId,
          },
        });
      }

      return { data: { deletedCount: categories.length } };
    }),
});
