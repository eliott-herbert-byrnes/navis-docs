import { createAuditLog } from "@/features/audit/utils/audit";
import {
  router,
  orgProcedure,
  adminProcedure,
  rateLimitMiddleware,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ProcedureStatus, ProcedureStyle } from "@prisma/client";
import { generateProcedureEmbeddings } from "@/features/ai/actions/generate-embeddings";
import { JsonObject } from "@prisma/client/runtime/client";
import { makeSlugFromTitle } from "@/features/procedures/utils/make-slug-from-title";
import { getInitialContentForStyle } from "@/features/procedures/utils/get-initial-content-for-style";
import { generatePlainTextFromTiptap } from "@/features/procedures/utils/generate-plain-text-from-tiptap";

const teamSchema = z.string().min(1, { message: "Team is required" });
const querySchema = z.string();
const procedureSchema = z.string();
const procedureIdSchema = z.uuid();
const createProcedureSchema = z.object({
  departmentId: z.string().min(1, { message: "Department is required" }),
  teamId: z.string().min(1, { message: "Team is required" }),
  procedureTitle: z.string().min(1, { message: "Is Required" }).max(100),
  procedureDescription: z.string().min(1, { message: "Is Required" }).max(500),
  procedureCategoryId: z.string().optional(),
  newProcedureCategory: z.boolean().optional(),
  newProcedureCategoryName: z.string().optional(),
  procedureStyle: z.enum(["raw", "steps", "flow", "yesno"]),
});
const updateProcedureContentSchema = z.object({
  procedureId: z.uuid(),
  versionId: z.uuid(),
  contentJSON: z.any(),
});

export const procedureRouter = router({
  // Query: GET-all procedures for export
  listForExport: adminProcedure
    .use(rateLimitMiddleware("procedure-get-procedures-for-export"))
    .input(z.void().optional())
    .query(async ({ ctx }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No organization found",
        });
      }

      const procedures = await ctx.db.procedure.findMany({
        where: {
          team: {
            department: {
              orgId: ctx.org.id,
            },
          },
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          pendingVersion: true,
          publishedVersion: true,
          category: {
            select: { name: true },
          },
          team: {
            select: {
              name: true,
              department: {
                select: { name: true },
              },
            },
          },
        },

        orderBy: [
          { team: { department: { name: "asc" } } },
          { team: { name: "asc" } },
          { title: "asc" },
        ],
        take: 5000,
      });

      return { procedures };
    }),

  // Query: GET-list uncategorized procedures
  list: orgProcedure
    .input(
      z.object({
        teamId: teamSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const procedures = await ctx.db.procedure.findMany({
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
      return { data: procedures };
    }),

  // Query: GET procedures for procedure-base
  getProceduresForBase: adminProcedure
    .input(
      z.object({
        search: z.string().max(100).optional(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No organization found",
        });
      }

      const where = {
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
      };

      const [procedures, total] = await Promise.all([
        ctx.db.procedure.findMany({
          where,
          select: {
            id: true,
            teamId: true,
            slug: true,
            title: true,
            description: true,
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            createdAt: true,
          },
          orderBy: {
            title: "asc",
          },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.db.procedure.count({ where }),
      ]);

      return {
        procedures: procedures ?? [],
        total,
        hasMore: input.offset + input.limit < total,
        currentPage: Math.floor(input.offset / input.limit) + 1,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  // Query: GET-categories with procedures
  categoriesWithProcedures: orgProcedure
    .input(
      z.object({
        teamId: teamSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const categories = await ctx.db.category.findMany({
        where: { teamId: input.teamId },
        select: {
          id: true,
          name: true,
          sortOrder: true,
          procedures: {
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
      }),
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

  // Query: GET categories for multiple teams (procedure-base list)
  getCategoriesForTeams: adminProcedure
    .input(
      z.object({
        teamIds: z.array(z.string().uuid()).min(1).max(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No organization found",
        });
      }
      const categories = await ctx.db.category.findMany({
        where: {
          teamId: { in: input.teamIds },
          team: {
            department: {
              orgId: ctx.org.id,
            },
          },
        },
        select: { id: true, name: true, sortOrder: true, teamId: true },
        orderBy: [{ teamId: "asc" }, { sortOrder: "asc" }],
      });
      const byTeam = categories.reduce<
        Record<string, { id: string; name: string; sortOrder: number }[]>
      >((acc, c) => {
        if (!acc[c.teamId]) acc[c.teamId] = [];
        acc[c.teamId].push({ id: c.id, name: c.name, sortOrder: c.sortOrder });
        return acc;
      }, {});
      return { categoriesByTeam: byTeam };
    }),

  // Query: GET-Individual procedure for edit
  getForEdit: orgProcedure
    .input(
      z.object({
        procedureId: procedureSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const procedure = await ctx.db.procedure.findFirst({
        where: {
          id: input.procedureId,
          team: {
            department: {
              orgId: ctx.org!.id,
            },
          },
        },
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

      if (!procedure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Procedure not found",
        });
      }

      return {
        data: procedure,
      };
    }),

  // Query: GET-procedure for view with favorite status
  getForView: orgProcedure
    .input(
      z.object({
        procedureId: procedureSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const [procedure, favorite] = await ctx.db.$transaction([
        ctx.db.procedure.findFirst({
          where: {
            id: input.procedureId,
            team: {
              department: {
                orgId: ctx.org!.id,
              },
            },
          },
          include: {
            publishedVersion: true,
            team: true,
            category: true,
          },
        }),
        ctx.db.favorite.findUnique({
          where: {
            userId_procedureId: {
              userId: ctx.user!.id ?? "",
              procedureId: input.procedureId,
            },
          },
          select: { userId: true },
        }),
      ]);

      if (!procedure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Procedure not found",
        });
      }

      return {
        data: procedure,
        isFavorite: !!favorite,
      };
    }),

  // Query: GET-Search Procedures
  searchProcedures: orgProcedure
    .input(
      z.object({
        teamId: teamSchema,
        query: querySchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.query || input.query.length === 0) {
        return { data: [] };
      }
      const procedures = await ctx.db.procedure.findMany({
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

      if (!procedures) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Error searching procedures",
        });
      }

      return { data: procedures };
    }),

  // Mutation: Create Procedure
  createProcedure: adminProcedure
    .use(rateLimitMiddleware("procedure-create"))
    .input(createProcedureSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        departmentId,
        teamId,
        procedureTitle,
        procedureDescription,
        procedureCategoryId,
        newProcedureCategory,
        newProcedureCategoryName,
        procedureStyle,
      } = input;

      const team = await ctx.db.team.findFirst({
        where: { id: teamId, departmentId: departmentId },
      });
      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }

      const styleMap: Record<string, ProcedureStyle> = {
        raw: ProcedureStyle.RAW,
        steps: ProcedureStyle.STEPS,
        flow: ProcedureStyle.FLOW,
        yesno: ProcedureStyle.YESNO,
      };
      const finalisedProcedureStyle = styleMap[procedureStyle];

      const existingName = await ctx.db.procedure.findFirst({
        where: { title: procedureTitle },
      });

      if (existingName) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This title has already been taken, please choose another.",
        });
      }

      let categoryId = procedureCategoryId;
      if (newProcedureCategory && newProcedureCategoryName) {
        const existingCategory = await ctx.db.category.findFirst({
          where: { name: newProcedureCategoryName },
        });

        if (existingCategory) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "This category name has already been taken, please choose another.",
          });
        }
        const newCategory = await ctx.db.category.create({
          data: {
            teamId: teamId,
            name: newProcedureCategoryName,
            sortOrder: 0,
          },
        });
        categoryId = newCategory.id;

        await createAuditLog({
          orgId: ctx.org!.id,
          actorId: ctx.user?.id ?? "",
          action: "CATEGORY_CREATED",
          entityType: "CATEGORY",
          entityId: newCategory.id,
          afterJSON: {
            id: newCategory.id,
            name: newCategory.name,
            teamId: newCategory.teamId,
          },
        });
      }

      const procedure = await ctx.db.procedure.create({
        data: {
          teamId: teamId,
          categoryId: categoryId || null,
          title: procedureTitle,
          description: procedureDescription,
          style: finalisedProcedureStyle,
          status: ProcedureStatus.DRAFT,
          slug: makeSlugFromTitle(procedureTitle),
        },
      });

      const version = await ctx.db.procedureVersion.create({
        data: {
          procedureId: procedure.id,
          createdBy: ctx.user?.id ?? "",
          style: finalisedProcedureStyle,
          contentJSON: getInitialContentForStyle(finalisedProcedureStyle),
        },
      });

      await ctx.db.procedure.update({
        where: { id: procedure.id },
        data: {
          pendingVersionId: version.id,
        },
      });

      await createAuditLog({
        orgId: ctx.org!.id,
        actorId: ctx.user?.id ?? "",
        action: "PROCEDURE_CREATED",
        entityType: "PROCEDURE",
        entityId: procedure.id,
        afterJSON: {
          id: procedure.id,
          title: procedure.title,
          description: procedure.description,
          slug: procedure.slug,
          style: procedure.style,
          status: procedure.status,
          teamId: procedure.teamId,
          categoryId: procedure.categoryId,
        },
      });
      return { data: procedure };
    }),

  // Mutation: Publish Procedure
  publishProcedure: adminProcedure
    .use(rateLimitMiddleware("procedure-publish"))
    .input(
      z.object({
        procedureId: procedureIdSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const procedure = await ctx.db.procedure.findUnique({
        where: {
          id: input.procedureId,
          team: {
            department: {
              orgId: ctx.org!.id,
            },
          },
        },
        include: {
          pendingVersion: true,
          publishedVersion: true,
        },
      });

      if (!procedure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Procedure not found",
        });
      }

      if (!procedure?.pendingVersion) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No pending version to publish",
        });
      }

      const contentText = generatePlainTextFromTiptap(
        procedure.pendingVersion.contentJSON as JsonObject,
      );

      await ctx.db.procedureVersion.update({
        where: { id: procedure.pendingVersion.id },
        data: {
          contentText,
        },
      });

      await ctx.db.procedure.update({
        where: { id: input.procedureId },
        data: {
          status: ProcedureStatus.PUBLISHED,
          publishedVersionId: procedure.pendingVersion.id,
        },
      });

      try {
        await generateProcedureEmbeddings(input.procedureId);
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Failed to embed procedure, contact customer support",
        });
      }

      await createAuditLog({
        orgId: ctx.org!.id,
        actorId: ctx?.user?.id ?? "",
        action: "PROCEDURE_PUBLISHED",
        entityType: "PROCEDURE",
        entityId: procedure.id,
        beforeJSON: {
          status: procedure.status,
          publishedVersionId: procedure.publishedVersionId,
        },
        afterJSON: {
          status: ProcedureStatus.PUBLISHED,
          publishedVersionId: procedure.pendingVersion.id,
        },
      });

      return { data: procedure };
    }),

  // Mutation: Delete Procedure
  deleteProcedure: adminProcedure
    .use(rateLimitMiddleware("procedure-delete"))
    .input(
      z.object({
        procedureId: procedureIdSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const procedure = await ctx.db.procedure.findUnique({
        where: {
          id: input.procedureId,
          team: {
            department: {
              orgId: ctx.org!.id,
            },
          },
        },
        include: {
          pendingVersion: true,
          publishedVersion: true,
        },
      });

      if (!procedure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Procedure not found",
        });
      }

      const categoryIdToCheck = procedure.categoryId;

      await ctx.db.procedure.delete({
        where: { id: input.procedureId },
      });

      await createAuditLog({
        orgId: ctx.org!.id,
        actorId: ctx?.user?.id ?? "",
        action: "PROCEDURE_DELETED",
        entityType: "PROCEDURE",
        entityId: input.procedureId,
      });

      if (categoryIdToCheck) {
        const remainingCount = await ctx.db.procedure.count({
          where: { categoryId: categoryIdToCheck },
        });
        if (remainingCount === 0) {
          const category = await ctx.db.category.findUnique({
            where: { id: categoryIdToCheck },
            select: { id: true, name: true, teamId: true },
          });
          if (category) {
            await ctx.db.category.delete({
              where: { id: categoryIdToCheck },
            });
            await createAuditLog({
              orgId: ctx.org!.id,
              actorId: ctx?.user?.id ?? "",
              action: "CATEGORY_DELETED",
              entityType: "CATEGORY",
              entityId: category.id,
              beforeJSON: {
                id: category.id,
                name: category.name,
                teamId: category.teamId,
                reason:
                  "Auto-removed: category had no remaining procedures after procedure deletion",
              },
            });
          }
        }
      }

      return {
        data: procedure,
      };
    }),

  // Mutation: Update procedure category
  updateProcedureCategory: adminProcedure
    .use(rateLimitMiddleware("procedure-update-category"))
    .input(
      z.object({
        procedureId: procedureIdSchema,
        categoryId: z.string().uuid().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No organization found",
        });
      }
      const procedure = await ctx.db.procedure.findFirst({
        where: {
          id: input.procedureId,
          team: {
            department: {
              orgId: ctx.org.id,
            },
          },
        },
        select: { id: true, teamId: true, categoryId: true },
      });
      if (!procedure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Procedure not found",
        });
      }
      if (input.categoryId !== null) {
        const category = await ctx.db.category.findFirst({
          where: {
            id: input.categoryId,
            teamId: procedure.teamId,
          },
        });
        if (!category) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Category not found or does not belong to this procedure's team",
          });
        }
      }
      const previousCategoryId = procedure.categoryId;
      await ctx.db.procedure.update({
        where: { id: input.procedureId },
        data: { categoryId: input.categoryId },
      });
      await createAuditLog({
        orgId: ctx.org.id,
        actorId: ctx.user?.id ?? "",
        action: "PROCEDURE_CATEGORY_UPDATED",
        entityType: "PROCEDURE",
        entityId: procedure.id,
        beforeJSON: { categoryId: previousCategoryId },
        afterJSON: { categoryId: input.categoryId },
      });
      return { data: { id: procedure.id, categoryId: input.categoryId } };
    }),

  // Mutate: Update Procedure Content
  updateProcedureContent: adminProcedure
    .use(rateLimitMiddleware("procedure-update"))
    .input(updateProcedureContentSchema)
    .mutation(async ({ ctx, input }) => {
      const procedure = await ctx.db.procedure.findUnique({
        where: {
          id: input.procedureId,
          team: {
            department: {
              orgId: ctx.org!.id,
            },
          },
        },
        include: { pendingVersion: true },
      });
      if (!procedure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Procedure not found",
        });
      }
      if (
        !procedure.pendingVersion ||
        procedure.pendingVersion.id !== input.versionId
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Version not found or not pending",
        });
      }

      const oldContent = procedure.pendingVersion.contentJSON;

      await ctx.db.procedureVersion.update({
        where: { id: input.versionId },
        data: { contentJSON: input.contentJSON },
      });

      await createAuditLog({
        orgId: ctx.org!.id,
        actorId: ctx?.user?.id ?? "",
        action: "PROCEDURE_EDITED",
        entityType: "PROCEDURE",
        entityId: procedure.id,
        beforeJSON: {
          versionId: input.versionId,
          contentJSON: oldContent,
        },
        afterJSON: {
          versionId: input.versionId,
          contentJSON: input.contentJSON,
        },
      });

      return {
        data: procedure,
      };
    }),
});
