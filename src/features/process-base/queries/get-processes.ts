// src/features/process-base/queries/get-processes.ts

"use server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type GetProcessesOptions = {
  orgId: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export const getProcesses = async ({
  orgId,
  search,
  limit = 10,
  offset = 0,
}: GetProcessesOptions) => {
  const user = await getSessionUser();
  if (!user) {
    return { processes: [], total: 0 };
  }

  const where = {
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
  };

  const [processes, total] = await Promise.all([
    prisma.process.findMany({
      where,
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
        createdAt: true,
      },
      orderBy: {
        title: "asc",
      },
      take: limit,
      skip: offset,
    }),
    prisma.process.count({ where }), 
  ]);

  return {
    processes,
    total,
    hasMore: offset + limit < total,
    currentPage: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit),
  };
};