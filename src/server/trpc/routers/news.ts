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

      const mappedNews = newsQuery.map((news) => ({
        id: news.id,
        title: news.title,
        body: news.bodyJSON,
        pinned: news.pinned,
        createdAt: news.createdAt,
        createdBy: news.createdBy,
        teamId: news.teamId,
        departmentId: news.team.departmentId,
      }));

      return {
        data: mappedNews,
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
          message: "News post not found",
        });
      }

      const deletedNews = await ctx.db.newsPost.delete({
        where: { id: input.newsPostId },
      });

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
