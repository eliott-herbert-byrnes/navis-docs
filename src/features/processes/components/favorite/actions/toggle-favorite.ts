"use server";

import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ToggleFavoriteProps = {
  processId: string;
  isFavorited: boolean;
};

export async function toggleFavorite({
  processId,
  isFavorited,
}: ToggleFavoriteProps): Promise<ActionState> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized");
    }

    const process = await prisma.process.findUnique({
      where: { id: processId },
    });

    if (!process) {
      return toActionState("ERROR", "Process not found");
    }

    if (isFavorited) {
      await prisma.favorite.deleteMany({
        where: {
          userId: user.userId,
          processId: processId,
        },
      });
    } else {
      await prisma.favorite.upsert({
        where: {
          userId_processId: {
            userId: user.userId,
            processId: processId,
          },
        },
        create: {
          userId: user.userId,
          processId: processId,
        },
        update: {},
      });
    }

    revalidatePath("/departments", "layout");

    return toActionState(
      "SUCCESS",
      isFavorited ? "Removed from favorites" : "Added to favorites"
    );
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
