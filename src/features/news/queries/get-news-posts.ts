"use server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getNewsPosts(departmentId: string, teamId: string) {
    const user = await getSessionUser();
    if (!user) {
        return [];
    }

    const newsPosts = await prisma.newsPost.findMany({
        where: {
            teamId: teamId,
            ...(departmentId && {
                team: {
                    departmentId: departmentId,
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

    return newsPosts.map((news) => ({
        id: news.id,
        title: news.title,
        body: news.bodyJSON,
        pinned: news.pinned,
        createdAt: news.createdAt,
        createdBy: news.createdBy,
        teamId: news.teamId,
        departmentId: news.team.departmentId,
    }));
}