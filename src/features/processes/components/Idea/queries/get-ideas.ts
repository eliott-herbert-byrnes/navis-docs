"use server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getIdeas(teamId: string, search?: string) {
  const user = await getSessionUser();
  if (!user) {
    return [];
  }

  const ideas = await prisma.idea.findMany({
    where: {
      teamId: teamId,
      ...(search
        ? {
            title: {
              contains: search,
              mode: "insensitive" as const,
            },
          }
        : {}),
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

  return ideas.map((idea) => ({
    createdBy: idea.createdBy,
    id: idea.id,
    title: idea.title,
    body: idea.body,
    status: idea.status,
    createdAt: idea.createdAt,
    teamId: idea.teamId,
    departmentId: idea.team.departmentId,
  }));
}

export async function getOrgIdeas(orgId: string, search?: string) {
  const user = await getSessionUser();
  if (!user) {
    return [];
  }

  const ideas = await prisma.idea.findMany({
    where: {
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

  return ideas.map((idea) => ({
    createdBy: idea.createdBy,
    id: idea.id,
    title: idea.title,
    body: idea.body,
    status: idea.status,
    createdAt: idea.createdAt,
    teamId: idea.teamId,
    departmentId: idea.team.departmentId,
  }));
}
