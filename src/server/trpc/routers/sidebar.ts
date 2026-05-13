import { router, orgProcedure } from "@/server/trpc/init";
import { z } from "zod";
import {
  OrgMembershipRole,
  ProcedureStatus,
  RolloutRoleFilter,
} from "@prisma/client";

export const sidebarRouter = router({
  getSidebarData: orgProcedure
    .input(z.object({ teamId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";
      const orgId = ctx.org.id;

      // Batch 1: all independent queries run in parallel
      const [uncategorizedProcedures, categories, membership, allNewsPosts] =
        await Promise.all([
          ctx.db.procedure.findMany({
            where: {
              teamId: input.teamId,
              categoryId: null,
              ...(ctx.isAdmin
                ? { status: { in: ["PUBLISHED", "DRAFT"] as const } }
                : { status: "PUBLISHED" }),
            },
            select: { id: true, slug: true, title: true, status: true },
            orderBy: { title: "asc" },
          }),
          ctx.db.category.findMany({
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
                orderBy: { title: "asc" },
              },
            },
            orderBy: { sortOrder: "asc" },
          }),
          ctx.db.orgMembership.findUnique({
            where: { orgId_userId: { orgId, userId } },
          }),
          ctx.db.newsPost.findMany({
            where: {
              teamId: input.teamId,
              team: { department: { orgId } },
            },
            select: { id: true, createdBy: true },
          }),
        ]);

      const postIdsToCheck = allNewsPosts
        .filter((p) => p.createdBy !== userId)
        .map((p) => p.id);

      const isUserInScope = (notifyRoleFilter: RolloutRoleFilter): boolean => {
        if (!membership) return false;
        if (notifyRoleFilter === RolloutRoleFilter.ALL_USERS) return true;
        if (notifyRoleFilter === RolloutRoleFilter.ADMINS_ONLY)
          return (
            membership.role === OrgMembershipRole.OWNER ||
            membership.role === OrgMembershipRole.ADMIN
          );
        if (notifyRoleFilter === RolloutRoleFilter.MEMBERS_ONLY)
          return membership.role === OrgMembershipRole.MEMBER;
        return false;
      };

      // Batch 2: two queries that each depend on one result from batch 1, run in parallel
      const [allRollouts, readNewsRecords] = await Promise.all([
        membership
          ? ctx.db.procedureRollout.findMany({
              where: {
                orgId,
                createdAt: { gte: membership.createdAt },
                procedure: { status: { not: ProcedureStatus.ARCHIVED } },
              },
              select: {
                procedureId: true,
                versionId: true,
                notifyRoleFilter: true,
              },
            })
          : ([] as {
              procedureId: string;
              versionId: string;
              notifyRoleFilter: RolloutRoleFilter;
            }[]),
        postIdsToCheck.length > 0
          ? ctx.db.userNewsRead.findMany({
              where: { userId, newsPostId: { in: postIdsToCheck } },
              select: { newsPostId: true },
            })
          : ([] as { newsPostId: string }[]),
      ]);

      const inScopeRollouts = allRollouts.filter((r) =>
        isUserInScope(r.notifyRoleFilter),
      );

      // Batch 3: procedure read records depend on inScopeRollouts from batch 2
      const procedureReads =
        inScopeRollouts.length > 0
          ? await ctx.db.userProcedureRead.findMany({
              where: {
                userId,
                OR: inScopeRollouts.map((r) => ({
                  procedureId: r.procedureId,
                  versionId: r.versionId,
                })),
              },
              select: { procedureId: true, versionId: true },
            })
          : ([] as { procedureId: string; versionId: string }[]);

      const readProcedureSet = new Set(
        procedureReads.map((r) => `${r.procedureId}:${r.versionId}`),
      );
      const outstanding = inScopeRollouts
        .filter((r) => !readProcedureSet.has(`${r.procedureId}:${r.versionId}`))
        .map((r) => ({ procedureId: r.procedureId, versionId: r.versionId }));

      const readNewsSet = new Set(readNewsRecords.map((r) => r.newsPostId));
      const unreadNewsCount = postIdsToCheck.filter(
        (id) => !readNewsSet.has(id),
      ).length;

      return {
        uncategorizedProcedures,
        categories,
        outstanding,
        unreadNewsCount,
      };
    }),
});
