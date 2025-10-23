"use server";

import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProcessStatus, ProcessStyle } from "@prisma/client";
import { slugify } from "inngest";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inputSchema = z.object({
  processTitle: z.string().min(1, { message: "Is Required" }).max(28),
  processDescription: z.string().min(1, { message: "Is Required" }).max(191),
  categoryId: z.string().min(1, { message: "Is Required" }).max(28),
  newCategoryName: z.string().min(1, { message: "Is Required" }).max(191),
});

export const createProcess = async (
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

    const parsed = inputSchema.parse({
      processTitle: String(formData.get("processTitle") ?? "").trim(),
      processDescription: String(
        formData.get("processDescription") ?? ""
      ).trim(),
      categoryId: String(formData.get("categoryId") ?? "").trim(),
      newCategoryName: String(formData.get("newCategoryName") ?? "").trim(),
    });
    const { processTitle, processDescription, categoryId, newCategoryName } =
      parsed;
    const slug = slugify(processTitle);
    const existingProcess = await prisma.process.findFirst({
      where: {
        slug: slug,
      },
    });
    if (existingProcess) {
      return toActionState("ERROR", "Process already exists", formData);
    }

    if (newCategoryName) {
      const newCategory = await prisma.category.create({
        data: {
          teamId: org.id,
          name: newCategoryName,
          sortOrder: 1,
        },
      });
    }

    const process = await prisma.process.create({
      data: {
        teamId: org.id,
        title: processTitle,
        description: processDescription,
        categoryId: categoryId,
        slug: slug,
        style: ProcessStyle.RAW,
        status: ProcessStatus.PUBLISHED,
      },
    });

    return toActionState("SUCCESS", "Process created successfully", formData, {
      process,
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};
