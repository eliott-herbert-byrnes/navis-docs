"use server";

import { ideasPath } from "@/app/paths";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getSessionUser, getUserOrg } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import DOMPurify from "dompurify";
import { createLimiter, getLimitByUser } from "@/lib/rate-limiter";

const inputSchema = z.object({
  teamId: z.string().min(1, { message: "Is Required" }),
  ideaBody: z.string().min(1, { message: "Is Required" }).max(1000),
  ideaTitle: z.string().min(1, { message: "Is Required" }).max(100),
});

export const createIdea = async (
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized", formData);
    }

    const { success } = await getLimitByUser(
      createLimiter,
      user.userId,
      "idea-create"
    );
    if (!success) {
      return toActionState("ERROR", "Too many requests", formData);
    }

    const org = await getUserOrg(user.userId);
    if (!org) {
      return toActionState("ERROR", "No organization found", formData);
    }

    const parsed = inputSchema.parse({
      teamId: formData.get("teamId") as string,
      ideaBody: formData.get("ideaBody") as string,
      ideaTitle: formData.get("ideaTitle") as string,
    });

    const { teamId, ideaBody, ideaTitle } = parsed;

    const sanitizedBody = DOMPurify.sanitize(ideaBody, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });

    const createdIdea = await prisma.idea.create({
      data: {
        title: ideaTitle,
        teamId,
        createdBy: user.userId,
        body: sanitizedBody,
        status: "NEW",
      },
    });

    revalidatePath(ideasPath());
    const successState = toActionState(
      "SUCCESS",
      "Idea submitted successfully",
      formData
    );
    return successState;
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};
