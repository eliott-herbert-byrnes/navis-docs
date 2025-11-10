"use server";

import { getSessionUser} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getErrors(orgId: string, search?: string) {
  const user = await getSessionUser();
  if (!user) {
    return [];
  }

  const errors = await prisma.errorReport.findMany({
    where: {
      process: {
        team: {
          department: {
            orgId: orgId,
          },
        },
        ...(search
          ? {
              title: {
                contains: search,
                mode: "insensitive" as const,
              },
            }
          : {}),
      },
    },
    include: {
      process: {
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

  return errors.map((error) => ({
    createdBy: error.createdBy,
    id: error.id,
    processName: error.process.title,
    category: error.process.category?.name || "Uncategorized",
    status: error.status,
    body: error.body,
    createdAt: error.createdAt,
    processId: error.processId,
    teamId: error.process.teamId,
    departmentId: error.process.team.departmentId,
  }));
}
