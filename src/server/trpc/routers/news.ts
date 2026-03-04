import { createAuditLog } from "@/features/audit/utils/audit";
import {
  router,
  orgProcedure,
  adminProcedure,
  rateLimitMiddleware,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const newsRouter = router({
  // Query: Get News Post
  getNews: orgProcedure
    .input(
      z.object({
        teamId: z.string(),
        departmentId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const newsQuery = await ctx.db.newsPost.findMany({
        where: {
          teamId: input.teamId,
          ...(input.departmentId && {
            team: {
              departmentId: input.departmentId,
            },
          }),
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

      if (!newsQuery) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Unable to load news posts, refresh the page or try again",
        });
      }

      const userId = ctx.user?.id ?? "";
      const postIds = newsQuery.map((n) => n.id);
      let readSet = new Set<string>();
      if (userId && postIds.length > 0) {
        try {
          const readRecords = await ctx.db.userNewsRead.findMany({
            where: {
              userId,
              newsPostId: { in: postIds },
            },
            select: { newsPostId: true },
          });
          readSet = new Set(readRecords.map((r) => r.newsPostId));
        } catch (error) {
          console.log(error)
        }
      }

      const mappedNews = newsQuery.map((news) => ({
        id: news.id,
        title: news.title,
        body: news.bodyJSON,
        pinned: news.pinned,
        createdAt: news.createdAt,
        createdBy: news.createdBy,
        teamId: news.teamId,
        departmentId: news.team.departmentId,
        isRead: readSet.has(news.id) || news.createdBy === userId,
      }));

      return {
        data: mappedNews,
      };
    }),
  // Query: Get unread news count for current user (team-scoped)
  getUnreadNewsCountForCurrentUser: orgProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";
      if (!userId) return { count: 0 };

      const newsPosts = await ctx.db.newsPost.findMany({
        where: {
          teamId: input.teamId,
          team: {
            department: {
              orgId: ctx.org!.id,
            },
          },
        },
        select: { id: true, createdBy: true },
      });

      const postIdsToCheck = newsPosts
        .filter((p) => p.createdBy !== userId)
        .map((p) => p.id);

      if (postIdsToCheck.length === 0) return { count: 0 };

      const readRecords = await ctx.db.userNewsRead.findMany({
        where: {
          userId,
          newsPostId: { in: postIdsToCheck },
        },
        select: { newsPostId: true },
      });
      const readSet = new Set(readRecords.map((r) => r.newsPostId));
      const unreadCount = postIdsToCheck.filter((id) => !readSet.has(id)).length;

      return { count: unreadCount };
    }),
  // Mutate: Mark News as Read
  markNewsRead: orgProcedure
    .use(rateLimitMiddleware("news-mark-read"))
    .input(
      z.object({
        newsPostId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newsPost = await ctx.db.newsPost.findUnique({
        where: { id: input.newsPostId },
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

      if (!newsPost || newsPost.team.department.orgId !== ctx.org!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "News post not found, select a valid post",
        });
      }

      const readRecord = await ctx.db.userNewsRead.upsert({
        where: {
          userId_newsPostId: {
            userId: ctx.user!.id ?? "",
            newsPostId: input.newsPostId,
          },
        },
        create: {
          userId: ctx.user!.id ?? "",
          newsPostId: input.newsPostId,
        },
        update: {
          readAt: new Date(),
        },
      });

      return {
        data: readRecord,
      };
    }),
  // Mutate: Create News
  createNews: adminProcedure
    .use(rateLimitMiddleware("news-create"))
    .input(
      z.object({
        teamId: z.string().min(1, { message: "Is Required" }),
        newsPostTitle: z.string().min(1, { message: "Is Required" }).max(100),
        newsPostBody: z.string().min(1, { message: "Is Required" }).max(1000),
        pinned: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const news = await ctx.db.newsPost.create({
        data: {
          teamId: input.teamId,
          title: input.newsPostTitle,
          bodyJSON: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: input.newsPostBody }],
              },
            ],
          },
          pinned: input.pinned,
          createdBy: ctx.user?.id ?? "",
        },
      });

      if (!news) {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Unable to create news post, try again or contact support",
        });
      }

      await createAuditLog({
        orgId: ctx.org?.id ?? "",
        actorId: ctx.user?.id ?? "",
        action: "NEWS_CREATED",
        entityType: "NEWS",
        entityId: news.id,
        afterJSON: JSON.parse(JSON.stringify(news)),
      });

      return {
        data: news,
      };
    }),
  // Mutate: Delete News
  deleteNews: adminProcedure
    .use(rateLimitMiddleware("news-delete"))
    .input(
      z.object({
        newsPostId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newsPost = await ctx.db.newsPost.findUnique({
        where: { id: input.newsPostId },
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

      if (!newsPost || newsPost.team.department.orgId !== ctx.org!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "News post not found, select a valid post",
        });
      }

      const deletedNews = await ctx.db.newsPost.delete({
        where: { id: input.newsPostId },
      });

      if (!deletedNews) {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Unable to delete news post, try again or contact support",
        });
      }

      await createAuditLog({
        orgId: ctx.org?.id ?? "",
        actorId: ctx.user?.id ?? "",
        action: "NEWS_DELETED",
        entityType: "NEWS",
        entityId: input.newsPostId,
        beforeJSON: JSON.parse(JSON.stringify(deletedNews)),
      });

      return {
        data: deletedNews,
      };
    }),
});
