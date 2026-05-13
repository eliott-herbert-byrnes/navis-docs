import {
  createAuditLog,
  getProcedureAuditLogs,
} from "@/features/audit/utils/audit";
import {
  router,
  orgProcedure,
  orgActiveProcedure,
  orgAdminProcedure,
  orgAdminActiveProcedure,
  adminProcedure,
  rateLimitMiddleware,
  protectedProcedure,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  OrgMembershipRole,
  Prisma,
  ProcedureStatus,
  ProcedureStyle,
  RolloutRoleFilter,
  RolloutType,
} from "@prisma/client";
import { generateProcedureEmbeddings } from "@/features/ai/actions/generate-embeddings";
import { JsonObject } from "@prisma/client/runtime/client";
import { makeSlugFromTitle } from "@/features/procedures/utils/make-slug-from-title";
import { getInitialContentForStyle } from "@/features/procedures/utils/get-initial-content-for-style";
import { generatePlainTextFromTiptap } from "@/features/procedures/utils/generate-plain-text-from-tiptap";
import { storage } from "@/lib/storage";
import { extractManagedImagePathsFromContent } from "@/lib/tiptap-utils";
import { revalidatePath, revalidateTag } from "next/cache";
import { after } from "next/server";

const teamSchema = z.string().min(1, { message: "Team is required" });
const querySchema = z.string();
const procedureSchema = z.string();
const procedureIdSchema = z.uuid();

const procedureTitleFieldSchema = z
  .string()
  .min(1, { message: "Is Required" })
  .max(100);

const procedureDescriptionFieldSchema = z
  .string()
  .min(1, { message: "Is Required" })
  .max(500);

const procedureTitleDescriptionFieldsSchema = z.object({
  procedureTitle: procedureTitleFieldSchema,
  procedureDescription: procedureDescriptionFieldSchema,
});

const createProcedureSchema = z
  .object({
    departmentId: z.string().min(1, { message: "Department is required" }),
    teamId: z.string().min(1, { message: "Team is required" }),
    procedureCategoryId: z.string().optional(),
    newProcedureCategory: z.boolean().optional(),
    newProcedureCategoryName: z.string().optional(),
    procedureStyle: z.enum(["raw", "steps", "flow", "yesno"]),
    notifyOnPublish: z.boolean().optional(),
    notifyRoleFilter: z.enum(RolloutRoleFilter).nullable().optional(),
    emailOnPublish: z.boolean().optional(),
    emailRoleFilter: z.enum(RolloutRoleFilter).nullable().optional(),
    newsOnPublish: z.boolean().optional(),
  })
  .merge(procedureTitleDescriptionFieldsSchema);

const updateProcedureDetailsSchema = z
  .object({
    procedureId: procedureIdSchema,
  })
  .merge(procedureTitleDescriptionFieldsSchema);

const updateProcedureContentSchema = z.object({
  procedureId: z.uuid(),
  versionId: z.uuid(),
  contentJSON: z.any(),
});
const procedureImagesBucket =
  process.env.SUPABASE_PROCEDURE_IMAGES_BUCKET ?? "procedure-images";

export const procedureRouter = router({
  // Query: GET-all procedures for export
  listForExport: adminProcedure
    .use(rateLimitMiddleware("procedure-get-procedures-for-export"))
    .input(z.void().optional())
    .query(async ({ ctx }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No organization found, reauthenticate your current session",
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

      if (!procedures) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No procedures found, try a different search or team",
        });
      }

      return { procedures };
    }),

  // Query: GET-all procedures for export scoped to a department
  listForExportByDepartment: adminProcedure
    .use(
      rateLimitMiddleware("procedure-get-procedures-for-export-by-department"),
    )
    .input(z.object({ departmentId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No organization found, reauthenticate your current session",
        });
      }

      const procedures = await ctx.db.procedure.findMany({
        where: {
          team: {
            department: {
              id: input.departmentId,
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
        orderBy: [{ team: { name: "asc" } }, { title: "asc" }],
        take: 5000,
      });

      if (!procedures) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No procedures found for this department",
        });
      }

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
          ...(ctx.isAdmin
            ? { status: { in: ["PUBLISHED", "DRAFT"] as const } }
            : { status: "PUBLISHED" }),
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
          message: "No organization found, reauthenticate your current session",
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
            status: true,
            description: true,
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
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
            where: ctx.isAdmin
              ? { OR: [{ status: "PUBLISHED" }, { status: "DRAFT" }] }
              : { status: "PUBLISHED" },
            select: {
              id: true,
              slug: true,
              title: true,
              status: true,
              publishedVersionId: true,
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
          message: "No organization found, reauthenticate your current session",
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
          message:
            "Procedure not found, refresh the page or select another procedure",
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
      const userId = ctx.user!.id ?? "";
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
              userId,
              procedureId: input.procedureId,
            },
          },
          select: { userId: true },
        }),
      ]);

      if (!procedure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Procedure not found, refresh the page or select another procedure",
        });
      }

      let isRead = false;
      if (procedure.publishedVersion) {
        const readRecord = await ctx.db.userProcedureRead.findUnique({
          where: {
            userId_procedureId_versionId: {
              userId,
              procedureId: procedure.id,
              versionId: procedure.publishedVersion.id,
            },
          },
          select: { userId: true },
        });
        isRead = !!readRecord;
      }

      return {
        data: procedure,
        isFavorite: !!favorite,
        isRead,
      };
    }),

  // Query: GET procedure audit logs (admin only)
  getProcedureAuditLogs: orgAdminProcedure
    .input(
      z.object({
        procedureId: z.string().uuid(),
        limit: z.number().min(1).max(50).optional(),
        offset: z.number().min(0).optional(),
        cursor: z.number().min(0).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 20;
      const offset = input.cursor ?? input.offset ?? 0;
      return getProcedureAuditLogs(ctx.org!.id, input.procedureId, {
        limit,
        offset,
      });
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
          message:
            "Error searching procedures, try a different search or refresh the page",
        });
      }

      return { data: procedures };
    }),

  // Mutation: Create Procedure
  createProcedure: orgAdminActiveProcedure
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
        notifyOnPublish,
        notifyRoleFilter,
        emailOnPublish,
        emailRoleFilter,
        newsOnPublish,
      } = input;

      const team = await ctx.db.team.findFirst({
        where: { id: teamId, departmentId: departmentId },
      });
      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found, refresh the page or select a valid team",
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
        where: {
          title: procedureTitle,
          team: {
            department: {
              orgId: ctx.org!.id,
            },
          },
        },
      });

      if (existingName) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This title has already been taken, choose another",
        });
      }

      let categoryId = procedureCategoryId;
      if (newProcedureCategory && newProcedureCategoryName) {
        const existingCategory = await ctx.db.category.findFirst({
          where: {
            name: newProcedureCategoryName,
            team: {
              department: {
                orgId: ctx.org!.id,
              },
            },
          },
        });

        if (existingCategory) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "This category name has already been taken, choose another",
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
          notifyOnPublish: notifyOnPublish || false,
          notifyRoleFilter: notifyRoleFilter || null,
          emailOnPublish: emailOnPublish || false,
          emailRoleFilter: emailRoleFilter || null,
          newsOnPublish: newsOnPublish || false,
        },
      });

      revalidateTag(`org-dashboard-${ctx?.org?.id}`, "max");
      revalidatePath(
        `/departments/${input.departmentId}/${input.teamId}/procedures`,
        "layout",
      );

      if (!procedure) {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Failed to create procedure, try again or contact support",
        });
      }

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
  publishProcedure: orgAdminActiveProcedure
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
          team: {
            include: {
              department: true,
            },
          },
        },
      });

      if (!procedure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Procedure not found, refresh the page or select another procedure",
        });
      }

      if (!procedure?.pendingVersion) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "No pending version to publish, save a draft first or make changes and try again",
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

      const {
        notifyOnPublish,
        notifyRoleFilter,
        emailOnPublish,
        emailRoleFilter,
        newsOnPublish,
      } = procedure;

      const shouldCreateRollout =
        notifyOnPublish || emailOnPublish || newsOnPublish;

      if (shouldCreateRollout) {
        const newPublishedVersionId = procedure.pendingVersion.id;
        const orgId = procedure.team.department.orgId;

        const rollout = await ctx.db.procedureRollout.create({
          data: {
            procedureId: procedure.id,
            versionId: newPublishedVersionId,
            orgId,
            notifyRoleFilter: notifyRoleFilter ?? RolloutRoleFilter.ALL_USERS,
            emailRoleFilter: emailOnPublish ? emailRoleFilter : null,
            rolloutType: RolloutType.NEW,
          },
        });

        let membershipWhere: Prisma.OrgMembershipWhereInput = {
          orgId,
        };

        if (rollout.notifyRoleFilter === RolloutRoleFilter.ADMINS_ONLY) {
          membershipWhere.role = {
            in: [OrgMembershipRole.OWNER, OrgMembershipRole.ADMIN],
          };
        } else if (
          rollout.notifyRoleFilter === RolloutRoleFilter.MEMBERS_ONLY
        ) {
          membershipWhere.role = OrgMembershipRole.MEMBER;
        }

        const memberships = await ctx.db.orgMembership.findMany({
          where: membershipWhere,
          select: { id: true, userId: true },
        });

        const inScopeUserIds = memberships.map((m) => m.userId);

        const existingReads = await ctx.db.userProcedureRead.findMany({
          where: {
            userId: { in: inScopeUserIds },
            procedureId: procedure.id,
            versionId: rollout.versionId,
          },
          select: { userId: true },
        });

        const userIdsWithRead = new Set(existingReads.map((r) => r.userId));

        const userIdsNeedingNonCompliant = inScopeUserIds.filter(
          (id) => !userIdsWithRead.has(id),
        );

        if (userIdsNeedingNonCompliant.length > 0) {
          await ctx.db.orgMembership.updateMany({
            where: {
              orgId,
              userId: { in: userIdsNeedingNonCompliant },
            },
            data: {
              compliant: false,
            },
          });
        }

        await createAuditLog({
          orgId,
          actorId: ctx.user?.id ?? "",
          action: "PROCEDURE_ROLLOUT",
          entityType: "PROCEDURE",
          entityId: procedure.id,
          afterJSON: {
            rolloutId: rollout.id,
            procedureId: procedure.id,
            versionId: rollout.versionId,
            when: new Date().toISOString(),
            who: ctx.user?.id ?? "",
            options: {
              notifyOnPublish: !!notifyOnPublish,
              emailOnPublish: !!emailOnPublish,
              newsOnPublish: !!newsOnPublish,
              notifyRoleFilter: rollout.notifyRoleFilter,
              emailRoleFilter: rollout.emailRoleFilter,
            },
          },
        });

        const rolloutPayload = {
          rolloutId: rollout.id,
          procedureId: procedure.id,
          versionId: rollout.versionId,
          orgId,
          notifyRoleFilter: rollout.notifyRoleFilter,
          emailOnPublish: !!emailOnPublish,
          emailRoleFilter: rollout.emailRoleFilter,
          newsOnPublish: !!newsOnPublish,
          procedureTitle: procedure.title,
          teamId: procedure.teamId,
          createdBy: ctx.user?.id ?? "",
        };

        after(async () => {
          const { runProcedureRollout } = await import(
            "@/features/procedures/jobs/run-procedure-rollout"
          );
          await runProcedureRollout(rolloutPayload);
        });
      }

      try {
        await generateProcedureEmbeddings(input.procedureId);
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Failed to embed procedure, try again or contact support",
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

      revalidatePath(
        `/departments/${procedure.team.departmentId}/${procedure.teamId}/procedures`,
        "layout",
      );

      return { data: procedure };
    }),

  // Mutation: Delete Procedure
  deleteProcedure: orgAdminActiveProcedure
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
          team: { select: { departmentId: true } },
        },
      });

      if (!procedure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Procedure not found, refresh the page or select another procedure",
        });
      }

      const categoryIdToCheck = procedure.categoryId;

      await ctx.db.procedure.delete({
        where: { id: input.procedureId },
      });

      revalidateTag(`org-dashboard-${ctx?.org?.id}`, "max");
      revalidatePath(
        `/departments/${procedure.team.departmentId}/${procedure.teamId}/procedures`,
        "layout",
      );

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

  // Mutation: Delete multiple procedures (bulk)
  deleteProcedures: orgAdminActiveProcedure
    .use(rateLimitMiddleware("procedure-bulk-delete"))
    .input(
      z.object({
        procedureIds: z.array(procedureIdSchema).min(1).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No organization found, reauthenticate your current session",
        });
      }

      const procedures = await ctx.db.procedure.findMany({
        where: {
          id: { in: input.procedureIds },
          team: {
            department: {
              orgId: ctx.org.id,
            },
          },
        },
        select: {
          id: true,
          categoryId: true,
          teamId: true,
          team: { select: { departmentId: true } },
        },
      });

      if (!procedures) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No procedure selected, please select a valid procedure",
        });
      }

      const idsToDelete = procedures.map((p) => p.id);
      const categoryIdsToCheck = [
        ...new Set(
          procedures
            .map((p) => p.categoryId)
            .filter((id): id is string => !!id),
        ),
      ];

      const deleteResult = await ctx.db.procedure.deleteMany({
        where: { id: { in: idsToDelete } },
      });

      revalidateTag(`org-dashboard-${ctx?.org?.id}`, "max");
      const seenTeamPaths = new Set<string>();
      for (const p of procedures) {
        const key = `${p.team.departmentId}/${p.teamId}`;
        if (!seenTeamPaths.has(key)) {
          seenTeamPaths.add(key);
          revalidatePath(`/departments/${key}/procedures`, "layout");
        }
      }

      for (const categoryIdToCheck of categoryIdsToCheck) {
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
              orgId: ctx.org.id,
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

      await createAuditLog({
        orgId: ctx.org.id,
        actorId: ctx?.user?.id ?? "",
        action: "PROCEDURES_DELETED",
        entityType: "PROCEDURE",
        entityId: JSON.stringify(idsToDelete),
      });

      return {
        data: { deletedCount: deleteResult.count },
      };
    }),

  // Mutation: Update procedure category
  updateProcedureCategory: orgAdminActiveProcedure
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
          message: "No organization found, reauthenticate your current session",
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
        select: {
          id: true,
          teamId: true,
          categoryId: true,
          team: { select: { departmentId: true } },
        },
      });
      if (!procedure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Procedure not found, refresh the page or select another procedure",
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
              "Category not found or does not belong to this procedure's team, choose a category from this team",
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
      revalidatePath(
        `/departments/${procedure.team.departmentId}/${procedure.teamId}/procedures`,
        "layout",
      );
      return { data: { id: procedure.id, categoryId: input.categoryId } };
    }),

  updateProcedureDetails: orgAdminActiveProcedure
    .use(rateLimitMiddleware("procedure-update-details"))
    .input(updateProcedureDetailsSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No organization found, reauthenticate your current session",
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
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          teamId: true,
          team: { select: { departmentId: true } },
        },
      });

      if (!procedure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Procedure not found, refresh the page or select another procedure",
        });
      }

      const procedureTitle = input.procedureTitle.trim();
      const procedureDescription = input.procedureDescription.trim();

      if (!procedureTitle.length || !procedureDescription.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Title and description cannot be empty",
        });
      }

      const previousTitle = procedure.title.trim();
      const previousDescription = (procedure.description ?? "").trim();

      if (
        procedureTitle === previousTitle &&
        procedureDescription === previousDescription
      ) {
        return { data: { id: procedure.id } };
      }

      const titleChanged = procedureTitle !== previousTitle;

      if (titleChanged) {
        const existingName = await ctx.db.procedure.findFirst({
          where: {
            id: { not: input.procedureId },
            title: procedureTitle,
            team: {
              department: {
                orgId: ctx.org.id,
              },
            },
          },
        });

        if (existingName) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This title has already been taken, choose another",
          });
        }
      }

      const newSlug = titleChanged
        ? makeSlugFromTitle(procedureTitle)
        : procedure.slug;

      await ctx.db.procedure.update({
        where: { id: procedure.id },
        data: {
          title: procedureTitle,
          description: procedureDescription,
          ...(titleChanged ? { slug: newSlug } : {}),
        },
      });

      await createAuditLog({
        orgId: ctx.org.id,
        actorId: ctx.user?.id ?? "",
        action: "PROCEDURE_DETAILS_UPDATED",
        entityType: "PROCEDURE",
        entityId: procedure.id,
        beforeJSON: {
          title: procedure.title,
          description: procedure.description,
          slug: procedure.slug,
        },
        afterJSON: {
          title: procedureTitle,
          description: procedureDescription,
          slug: newSlug,
        },
      });

      revalidateTag(`org-dashboard-${ctx.org.id}`, "max");
      revalidatePath(
        `/departments/${procedure.team.departmentId}/${procedure.teamId}/procedures`,
        "layout",
      );

      return { data: { id: procedure.id } };
    }),

  // Mutate: Update Procedure Content
  updateProcedureContent: orgAdminActiveProcedure
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
        include: { pendingVersion: true, publishedVersion: true },
      });
      if (!procedure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Procedure not found, refresh the page or select another procedure",
        });
      }
      if (
        !procedure.pendingVersion ||
        procedure.pendingVersion.id !== input.versionId
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Version not found or not pending, save a draft first or select another version",
        });
      }

      const oldContent = procedure.pendingVersion.contentJSON;

      await ctx.db.procedureVersion.update({
        where: { id: input.versionId },
        data: { contentJSON: input.contentJSON },
      });

      // Delete managed images that were removed from the document.
      // Cleanup is best-effort and should not block content saves.
      try {
        const oldImagePaths = extractManagedImagePathsFromContent(oldContent);
        const newImagePaths = extractManagedImagePathsFromContent(
          input.contentJSON,
        );
        const publishedImagePaths = extractManagedImagePathsFromContent(
          procedure.publishedVersion?.contentJSON,
        );
        const keptPaths = new Set([...newImagePaths, ...publishedImagePaths]);

        const procedureFolder = `orgs/${ctx.org!.id}/procedures/${input.procedureId}`;
        let listedObjects: { name: string }[] = [];
        try {
          listedObjects = await storage.list(
            procedureImagesBucket,
            procedureFolder,
            { limit: 1000, offset: 0 },
          );
        } catch (listError) {
          console.error(
            "Failed to list procedure images for cleanup:",
            listError,
          );
        }

        const listedPaths = listedObjects
          .filter((obj) => !!obj.name)
          .map((obj) => `${procedureFolder}/${obj.name}`);

        const removedPaths = listedPaths.filter((path) => !keptPaths.has(path));
        const referencedRemovedPaths = [...oldImagePaths].filter(
          (path) => !newImagePaths.has(path),
        );
        const deletionSet = new Set([
          ...removedPaths,
          ...referencedRemovedPaths,
        ]);

        if (deletionSet.size > 0) {
          try {
            await storage.remove(procedureImagesBucket, [...deletionSet]);
          } catch (err) {
            console.error("Failed to remove orphaned procedure images:", err);
          }
        }
      } catch (error) {
        console.error("Procedure image cleanup failed:", error);
      }

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
  // Mutate: Mark Procedure as Read
  markProcedureRead: orgActiveProcedure
    .use(rateLimitMiddleware("procedure-marked-as-read"))
    .input(
      z.object({
        procedureId: z.uuid(),
        versionId: z.uuid(),
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
          publishedVersion: true,
          team: { select: { departmentId: true } },
        },
      });
      if (!procedure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Procedure not found, refresh the page or select another procedure",
        });
      }

      if (
        !procedure.publishedVersion ||
        procedure.publishedVersion.id !== input.versionId
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Version is not the current published version for this procedure",
        });
      }

      const userId = ctx.user!.id ?? "";

      // Marks procedure as read
      await ctx.db.userProcedureRead.upsert({
        where: {
          userId_procedureId_versionId: {
            userId,
            procedureId: input.procedureId,
            versionId: input.versionId,
          },
        },
        update: {
          readAt: new Date(),
        },
        create: {
          userId,
          procedureId: input.procedureId,
          versionId: input.versionId,
          readAt: new Date(),
        },
      });

      revalidatePath(
        `/departments/${procedure.team.departmentId}/${procedure.teamId}/procedures`,
        "layout",
      );

      const orgId = ctx.org!.id;

      const membership = await ctx.db.orgMembership.findUnique({
        where: {
          orgId_userId: {
            orgId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User is not a member of this organization",
        });
      }

      // Phase 7.2 + 7.3: Rollouts for compliant recomputation — non-archived only; only rollouts created after user joined (new joiners have no outstanding)
      const rollouts = await ctx.db.procedureRollout.findMany({
        where: {
          orgId,
          createdAt: { gte: membership.createdAt },
          procedure: {
            status: { not: ProcedureStatus.ARCHIVED },
          },
        },
        select: {
          id: true,
          procedureId: true,
          versionId: true,
          notifyRoleFilter: true,
        },
      });

      const isUserInScopeForRollout = (notifyRoleFilter: RolloutRoleFilter) => {
        if (notifyRoleFilter === RolloutRoleFilter.ALL_USERS) return true;
        if (notifyRoleFilter === RolloutRoleFilter.ADMINS_ONLY) {
          return (
            membership.role === OrgMembershipRole.OWNER ||
            membership.role === OrgMembershipRole.ADMIN
          );
        }
        if (notifyRoleFilter === RolloutRoleFilter.MEMBERS_ONLY) {
          return membership.role === OrgMembershipRole.MEMBER;
        }
        return false;
      };

      const inScopeRollouts = rollouts.filter((r) =>
        isUserInScopeForRollout(r.notifyRoleFilter),
      );

      if (inScopeRollouts.length === 0) {
        await ctx.db.orgMembership.update({
          where: { id: membership.id },
          data: { compliant: true },
        });
        return { data: { read: true, compliant: true } };
      }

      // Get all reads for this user over the in-scope rollout
      const reads = await ctx.db.userProcedureRead.findMany({
        where: {
          userId,
          OR: inScopeRollouts.map((r) => ({
            procedureId: r.procedureId,
            versionId: r.versionId,
          })),
        },
        select: {
          procedureId: true,
          versionId: true,
        },
      });

      const readSet = new Set(
        reads.map((r) => `${r.procedureId}:${r.versionId}`),
      );

      const hasOutstanding = inScopeRollouts.some((r) => {
        const key = `${r.procedureId}:${r.versionId}`;
        return !readSet.has(key);
      });

      // If nothing outstanding mark as compliant
      if (!hasOutstanding && !membership.compliant) {
        await ctx.db.orgMembership.update({
          where: { id: membership.id },
          data: { compliant: true },
        });
      }

      return {
        data: {
          read: true,
          compliant: !hasOutstanding,
        },
      };
    }),
  // Query: GET outstanding procedure versions for current user (unread rollouts in this org)
  getOutstandingForCurrentUser: orgProcedure
    .input(
      z.object({
        orgId: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const orgId = input.orgId ?? ctx.org!.id;
      const userId = ctx.user!.id ?? "";

      const membership = await ctx.db.orgMembership.findUnique({
        where: {
          orgId_userId: {
            orgId,
            userId,
          },
        },
      });

      if (!membership) {
        return { data: [] };
      }

      const rollouts = await ctx.db.procedureRollout.findMany({
        where: {
          orgId,
          createdAt: { gte: membership.createdAt },
          procedure: {
            status: { not: ProcedureStatus.ARCHIVED },
          },
        },
        select: {
          procedureId: true,
          versionId: true,
          notifyRoleFilter: true,
        },
      });

      const isUserInScopeForRollout = (notifyRoleFilter: RolloutRoleFilter) => {
        if (notifyRoleFilter === RolloutRoleFilter.ALL_USERS) return true;
        if (notifyRoleFilter === RolloutRoleFilter.ADMINS_ONLY) {
          return (
            membership.role === OrgMembershipRole.OWNER ||
            membership.role === OrgMembershipRole.ADMIN
          );
        }
        if (notifyRoleFilter === RolloutRoleFilter.MEMBERS_ONLY) {
          return membership.role === OrgMembershipRole.MEMBER;
        }
        return false;
      };

      const inScopeRollouts = rollouts.filter((r) =>
        isUserInScopeForRollout(r.notifyRoleFilter),
      );

      if (inScopeRollouts.length === 0) {
        return { data: [] };
      }

      const reads = await ctx.db.userProcedureRead.findMany({
        where: {
          userId,
          OR: inScopeRollouts.map((r) => ({
            procedureId: r.procedureId,
            versionId: r.versionId,
          })),
        },
        select: {
          procedureId: true,
          versionId: true,
        },
      });

      const readSet = new Set(
        reads.map((r) => `${r.procedureId}:${r.versionId}`),
      );

      const outstanding = inScopeRollouts.filter((r) => {
        const key = `${r.procedureId}:${r.versionId}`;
        return !readSet.has(key);
      });

      return {
        data: outstanding.map((r) => ({
          procedureId: r.procedureId,
          versionId: r.versionId,
        })),
      };
    }),
  // Query: GET outstanding procedure versions for a given user (admin only; for user list viewer)
  getOutstandingForUser: adminProcedure
    .use(rateLimitMiddleware("procedure-get-outstanding-for-user"))
    .input(
      z.object({
        userId: z.string().uuid(),
        orgId: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const orgId = input.orgId ?? ctx.org?.id;
      if (!orgId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Organization context or orgId is required",
        });
      }
      const userId = input.userId;

      const membership = await ctx.db.orgMembership.findUnique({
        where: {
          orgId_userId: {
            orgId,
            userId,
          },
        },
      });

      if (!membership) {
        return { data: [] };
      }

      const rollouts = await ctx.db.procedureRollout.findMany({
        where: {
          orgId,
          createdAt: { gte: membership.createdAt },
          procedure: {
            status: { not: ProcedureStatus.ARCHIVED },
          },
        },
        select: {
          procedureId: true,
          versionId: true,
          notifyRoleFilter: true,
          procedure: { select: { title: true } },
        },
      });

      const isUserInScopeForRollout = (notifyRoleFilter: RolloutRoleFilter) => {
        if (notifyRoleFilter === RolloutRoleFilter.ALL_USERS) return true;
        if (notifyRoleFilter === RolloutRoleFilter.ADMINS_ONLY) {
          return (
            membership.role === OrgMembershipRole.OWNER ||
            membership.role === OrgMembershipRole.ADMIN
          );
        }
        if (notifyRoleFilter === RolloutRoleFilter.MEMBERS_ONLY) {
          return membership.role === OrgMembershipRole.MEMBER;
        }
        return false;
      };

      const inScopeRollouts = rollouts.filter((r) =>
        isUserInScopeForRollout(r.notifyRoleFilter),
      );

      if (inScopeRollouts.length === 0) {
        return { data: [] };
      }

      const reads = await ctx.db.userProcedureRead.findMany({
        where: {
          userId,
          OR: inScopeRollouts.map((r) => ({
            procedureId: r.procedureId,
            versionId: r.versionId,
          })),
        },
        select: {
          procedureId: true,
          versionId: true,
        },
      });

      const readSet = new Set(
        reads.map((r) => `${r.procedureId}:${r.versionId}`),
      );

      const outstanding = inScopeRollouts.filter((r) => {
        const key = `${r.procedureId}:${r.versionId}`;
        return !readSet.has(key);
      });

      return {
        data: outstanding.map((r) => ({
          procedureId: r.procedureId,
          versionId: r.versionId,
          procedureTitle: r.procedure.title,
        })),
      };
    }),
});
