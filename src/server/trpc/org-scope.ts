import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export async function assertTeamInOrg(
  db: PrismaClient,
  teamId: string,
  orgId: string,
): Promise<void> {
  const team = await db.team.findFirst({
    where: {
      id: teamId,
      department: { orgId },
    },
    select: { id: true },
  });

  if (!team) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Team not found, refresh the page or select a valid team",
    });
  }
}
