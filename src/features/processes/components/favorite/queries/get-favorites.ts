"use server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getFavorites(teamId: string) {
  const user = await getSessionUser();
  if (!user) {
    return [];
  }

  const favorites = await prisma.favorite.findMany({
    where: {
      userId: user.userId,
      process: {
        teamId: teamId,
        status: "PUBLISHED",
      },
    },
    include: {
      process: {
        include: {
          category: {
            select: {
              name: true,
            },
          },
          publishedVersion: {
            select: {
              contentText: true,
            },
          },
        },
      },
    },
    orderBy: {
        process: {
            title: "asc",
        }
    }
  });

  return favorites.map((fav) => fav.process)
}
