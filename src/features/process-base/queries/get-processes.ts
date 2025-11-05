"use server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const getProcesses = async (orgId: string, search?: string) => {
    const user = await getSessionUser();
    if (!user) {
        return [];
    }

    const allProcesses = await prisma.process.findMany({
        where: {
            team: {
                department: {
                    orgId: orgId,
                },
            },
            ...(search ? {
                title: {
                    contains: search,
                    mode: "insensitive" as const,
                },
            } : {}),
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
            createdAt: true,
    },
        orderBy: {
            title: "asc",
        },
        take: 10,
    });

    return allProcesses;
}