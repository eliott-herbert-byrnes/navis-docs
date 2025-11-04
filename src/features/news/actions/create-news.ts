"use server";
import { newsPath } from "@/app/paths";
import { ActionState, fromErrorToActionState, toActionState } from "@/components/form/utils/to-action-state";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";


const createNewsSchema = z.object({
  teamId: z.string().min(1, { message: "Is Required" }),
  newsPostTitle: z.string().min(1, { message: "Is Required" }).max(100),
  newsPostBody: z.string().min(1, { message: "Is Required" }).max(1000),
  pinned: z.boolean().optional(),
});

export const createNews = async (
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized", formData);
    }

    const org = await getUserOrg(user.userId);
    if (!org) {
      return toActionState("ERROR", "No organization found", formData);
    }

    const isAdmin = await isOrgAdminOrOwner(user.userId);
    if (!isAdmin) {
      return toActionState("ERROR", "Forbidden", formData);
    }

    const departmentId = String(formData.get("departmentId") ?? "");

    const parsed = createNewsSchema.parse({
      teamId: formData.get("teamId") as string,
      newsPostTitle: formData.get("newsPostTitle") as string,
      newsPostBody: formData.get("newsPostBody") as string,
      pinned: formData.get("pinned") === "on",
    });

    const { teamId, newsPostTitle, newsPostBody, pinned } = parsed;

    const createdNews = await prisma.newsPost.create({
      data: {
        teamId,
        title: newsPostTitle,
        bodyJSON: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: newsPostBody }] },
          ],
        },
        pinned,
        createdBy: user.userId,
      },
    });

    revalidatePath(newsPath(departmentId, teamId), "layout");
    const successState = toActionState(
      "SUCCESS",
      "News post created successfully",
      formData
    );
    successState.data = {
        ...successState.data,
      redirect: newsPath(departmentId, teamId),
    };
    return successState;
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};