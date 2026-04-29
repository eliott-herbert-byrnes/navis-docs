import type { PrismaClient } from "@prisma/client";

/** Deletes all data scoped to one organization (demo reset). */
export async function wipeDemoOrg(
  prisma: PrismaClient,
  orgId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const teams = await tx.team.findMany({
      where: { department: { orgId } },
      select: { id: true },
    });
    const teamIds = teams.map((t) => t.id);

    const procedureIds =
      teamIds.length === 0
        ? []
        : (
            await tx.procedure.findMany({
              where: { teamId: { in: teamIds } },
              select: { id: true },
            })
          ).map((p) => p.id);

    if (procedureIds.length > 0) {
      await tx.procedure.updateMany({
        where: { id: { in: procedureIds } },
        data: { pendingVersionId: null, publishedVersionId: null },
      });
    }

    await tx.ingestionJob.deleteMany({
      where: {
        OR: [
          { orgId },
          ...(procedureIds.length > 0
            ? [{ procedureId: { in: procedureIds } }]
            : []),
        ],
      },
    });
    await tx.auditExportJob.deleteMany({ where: { orgId } });
    await tx.auditLog.deleteMany({ where: { orgId } });
    await tx.procedureRollout.deleteMany({ where: { orgId } });

    if (procedureIds.length > 0) {
      await tx.userProcedureRead.deleteMany({
        where: { procedureId: { in: procedureIds } },
      });
      await tx.favorite.deleteMany({
        where: { procedureId: { in: procedureIds } },
      });
      await tx.errorReport.deleteMany({
        where: { procedureId: { in: procedureIds } },
      });
      await tx.procedureChunk.deleteMany({
        where: { procedureId: { in: procedureIds } },
      });
      await tx.procedureVersion.deleteMany({
        where: { procedureId: { in: procedureIds } },
      });
      await tx.procedure.deleteMany({ where: { id: { in: procedureIds } } });
    }

    if (teamIds.length > 0) {
      const newsIds = (
        await tx.newsPost.findMany({
          where: { teamId: { in: teamIds } },
          select: { id: true },
        })
      ).map((n) => n.id);
      if (newsIds.length > 0) {
        await tx.userNewsRead.deleteMany({
          where: { newsPostId: { in: newsIds } },
        });
      }
      await tx.newsPost.deleteMany({ where: { teamId: { in: teamIds } } });
      await tx.idea.deleteMany({ where: { teamId: { in: teamIds } } });
      await tx.category.deleteMany({ where: { teamId: { in: teamIds } } });
      await tx.team.deleteMany({ where: { id: { in: teamIds } } });
    }

    await tx.department.deleteMany({ where: { orgId } });
    await tx.address.deleteMany({ where: { orgId } });
    await tx.invitation.deleteMany({ where: { orgId } });
    await tx.orgMembership.deleteMany({ where: { orgId } });
    await tx.organization.deleteMany({ where: { id: orgId } });
  });
}
