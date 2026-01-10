import { createAuditLog } from "@/features/audit/utils/audit";
import { getInitialContentForStyle } from "@/features/processes/utils/get-initial-content-for-style";
import { makeSlugFromTitle } from "@/features/processes/utils/make-slug-from-title";
import {
  router,
  orgProcedure,
  adminProcedure,
  rateLimitMiddleware,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ProcessStatus, ProcessStyle } from "@prisma/client";
import { generatePlainTextFromTiptap } from "@/features/processes/utils/generate-plain-text-from-tiptap";
import { JsonObject } from "@prisma/client/runtime/library";
import { generateProcessEmbeddings } from "@/features/ai/actions/generate-embeddings";

const teamSchema = z.string().min(1, { message: "Team is required" });
const querySchema = z.string();
const processSchema = z.string();
const processIdSchema = z.uuid();
const createProcessSchema = z.object({
  departmentId: z.string().min(1, { message: "Department is required" }),
  teamId: z.string().min(1, { message: "Team is required" }),
  processTitle: z.string().min(1, { message: "Is Required" }).max(100),
  processDescription: z.string().min(1, { message: "Is Required" }).max(500),
  processCategoryId: z.string().optional(),
  newProcessCategory: z.boolean().optional(),
  newProcessCategoryName: z.string().optional(),
  processStyle: z.enum(["raw", "steps", "flow", "yesno"]),
});
const updateProcessContentSchema = z.object({
  processId: z.uuid(),
  versionId: z.uuid(),
  contentJSON: z.any(),
});

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
        return { data: [] };
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

      if (!processes) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Error searching processes",
        });
      }

      return { data: processes };
    }),

  // Mutation: Create Process
  createProcess: adminProcedure
    .use(rateLimitMiddleware("process-create"))
    .input(createProcessSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        departmentId,
        teamId,
        processTitle,
        processDescription,
        processCategoryId,
        newProcessCategory,
        newProcessCategoryName,
        processStyle,
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

      let categoryId = processCategoryId;
      if (newProcessCategory && newProcessCategoryName) {
        const newCategory = await ctx.db.category.create({
          data: {
            teamId: teamId,
            name: newProcessCategoryName,
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

      const styleMap: Record<string, ProcessStyle> = {
        raw: ProcessStyle.RAW,
        steps: ProcessStyle.STEPS,
        flow: ProcessStyle.FLOW,
        yesno: ProcessStyle.YESNO,
      };
      const finalisedProcessStyle = styleMap[processStyle];

      const process = await ctx.db.process.create({
        data: {
          teamId: teamId,
          categoryId: categoryId || null,
          title: processTitle,
          description: processDescription,
          style: finalisedProcessStyle,
          status: ProcessStatus.DRAFT,
          slug: makeSlugFromTitle(processTitle),
        },
      });

      const version = await ctx.db.processVersion.create({
        data: {
          processId: process.id,
          createdBy: ctx.user?.id ?? "",
          style: finalisedProcessStyle,
          contentJSON: getInitialContentForStyle(finalisedProcessStyle),
        },
      });

      await ctx.db.process.update({
        where: { id: process.id },
        data: {
          pendingVersionId: version.id,
        },
      });

      await createAuditLog({
        orgId: ctx.org!.id,
        actorId: ctx.user?.id ?? "",
        action: "PROCESS_CREATED",
        entityType: "PROCESS",
        entityId: process.id,
        afterJSON: {
          id: process.id,
          title: process.title,
          description: process.description,
          slug: process.slug,
          style: process.style,
          status: process.status,
          teamId: process.teamId,
          categoryId: process.categoryId,
        },
      });
      return { data: process };
    }),

  // Mutation: Publish Process
  publishProcess: adminProcedure
    .use(rateLimitMiddleware("process-publish"))
    .input(
      z.object({
        processId: processIdSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const process = await ctx.db.process.findUnique({
        where: { id: input.processId },
        include: {
          pendingVersion: true,
          publishedVersion: true,
        },
      });

      if (!process) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Process not found",
        });
      }

      if (!process?.pendingVersion) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No pending version to publish",
        });
      }

      const contentText = generatePlainTextFromTiptap(
        process.pendingVersion.contentJSON as JsonObject
      );

      await ctx.db.processVersion.update({
        where: { id: process.pendingVersion.id },
        data: {
          contentText,
        },
      });

      await ctx.db.process.update({
        where: { id: input.processId },
        data: {
          status: ProcessStatus.PUBLISHED,
          publishedVersionId: process.pendingVersion.id,
        },
      });

      try {
        await generateProcessEmbeddings(input.processId);
      } catch (error) {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Failed to embed process, contact customer support",
        });
      }

      await createAuditLog({
        orgId: ctx.org!.id,
        actorId: ctx?.user?.id ?? "",
        action: "PROCESS_PUBLISHED",
        entityType: "PROCESS",
        entityId: process.id,
        beforeJSON: {
          status: process.status,
          publishedVersionId: process.publishedVersionId,
        },
        afterJSON: {
          status: ProcessStatus.PUBLISHED,
          publishedVersionId: process.pendingVersion.id,
        },
      });

      return { data: process };
    }),

  // Mutation: Delete Process
  deleteProcess: adminProcedure
    .use(rateLimitMiddleware("process-delete"))
    .input(
      z.object({
        processId: processIdSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const process = await ctx.db.process.findUnique({
        where: { id: input.processId },
        include: {
          pendingVersion: true,
          publishedVersion: true,
        },
      });

      if (!process) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Process not found",
        });
      }

      await ctx.db.process.delete({
        where: { id: input.processId },
      });

      await createAuditLog({
        orgId: ctx.org!.id,
        actorId: ctx?.user?.id ?? "",
        action: "PROCESS_DELETED",
        entityType: "PROCESS",
        entityId: input.processId,
      });

      return {
        data: process,
      };
    }),
  // Mutate: Update Process Content
  updateProcessContent: adminProcedure
    .use(rateLimitMiddleware("process-update"))
    .input(updateProcessContentSchema)
    .mutation(async ({ ctx, input }) => {
      const process = await ctx.db.process.findUnique({
        where: { id: input.processId },
        include: { pendingVersion: true },
      });
      if (!process) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Process not found",
        });
      }
      if (
        !process.pendingVersion ||
        process.pendingVersion.id !== input.versionId
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Version not found or not pending",
        });
      }

      const oldContent = process.pendingVersion.contentJSON;

      await ctx.db.processVersion.update({
        where: { id: input.versionId },
        data: { contentJSON: input.contentJSON },
      });

      await createAuditLog({
        orgId: ctx.org!.id,
        actorId: ctx?.user?.id ?? "",
        action: "PROCESS_EDITED",
        entityType: "PROCESS",
        entityId: process.id,
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
        data: process,
      };
    }),
});
