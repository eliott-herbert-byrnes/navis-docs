"use server";

import { prisma } from "@/lib/prisma";

export const searchProcesses = async (teamId: string, query: string) => {
    if(!query || query.trim().length === 0){
        return [];
    }

    const processes = await prisma.process.findMany({
        where: {
            teamId,
            status: "PUBLISHED",
            title: {
                contains: query,
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
                }
      },
    },
    orderBy: {
        title: "asc",
    },
    take: 10,
  });

  return processes;
};