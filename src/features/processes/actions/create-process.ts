"use server";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { createAuditLog } from "@/features/audit/utils/audit";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProcessStatus, ProcessStyle } from "@prisma/client";
import { z } from "zod";
import { makeSlugFromTitle } from "../utils/make-slug-from-title";
import { getInitialContentForStyle } from "../utils/get-initial-content-for-style";
import { editProcessPath } from "@/app/paths";

const inputSchema = z.object({
  departmentId: z.string().min(1, { message: "Department is required" }),
  teamId: z.string().min(1, { message: "Team is required" }),
  processTitle: z.string().min(1, { message: "Is Required" }).max(100),
  processDescription: z.string().min(1, { message: "Is Required" }).max(500),
  processCategoryId: z.string().optional(),
  newProcessCategory: z.boolean().optional(),
  newProcessCategoryName: z.string().optional(),
  processStyle: z.enum(["raw", "steps", "flow", "yesno"]),
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
      departmentId: String(formData.get("departmentId") ?? "").trim(),
      teamId: String(formData.get("teamId") ?? "").trim(),
      processTitle: String(formData.get("processTitle") ?? "").trim(),
      processDescription: String(
        formData.get("processDescription") ?? ""
      ).trim(),
      processCategoryId:
        String(formData.get("processCategoryId") ?? "").trim() || undefined,
      newProcessCategory: formData.get("newProcessCategory") === "on",
      newProcessCategoryName:
        String(formData.get("newProcessCategoryName") ?? "").trim() ||
        undefined,
      processStyle: String(formData.get("processStyle") ?? "raw").trim() as
        | "raw"
        | "steps"
        | "flow"
        | "yesno",
    });

    const {
      departmentId,
      teamId,
      processTitle,
      processDescription,
      processCategoryId,
      newProcessCategory,
      newProcessCategoryName,
      processStyle,
    } = parsed;

    const team = await prisma.team.findFirst({
      where: { id: teamId, departmentId: departmentId },
    });
    if (!team) {
      return toActionState("ERROR", "Team not found", formData);
    }

    let categoryId = processCategoryId;
    if (newProcessCategory && newProcessCategoryName) {
      const newCategory = await prisma.category.create({
        data: {
          teamId: teamId,
          name: newProcessCategoryName,
          sortOrder: 0,
        },
      });
      categoryId = newCategory.id;

      await createAuditLog({
        orgId: org.id,
        actorId: user.userId,
        action: "CATEGORY_CREATED",
        entityType: "CATEGORY",
        entityId: newCategory.id,
        afterJSON: {
          id: newCategory.id,
          name: newCategory.name,
          teamId: newCategory.teamId,
        },
      });
    }

    const styleMap: Record<string, ProcessStyle> = {
      raw: ProcessStyle.RAW,
      steps: ProcessStyle.STEPS,
      flow: ProcessStyle.FLOW,
      yesno: ProcessStyle.YESNO,
    };
    const finalisedProcessStyle = styleMap[processStyle];

    const process = await prisma.process.create({
      data: {
        teamId: teamId,
        categoryId: categoryId || null,
        title: processTitle,
        description: processDescription,
        style: finalisedProcessStyle,
        status: ProcessStatus.DRAFT,
        slug: makeSlugFromTitle(processTitle),
      },
    });

    const version = await prisma.processVersion.create({
      data: {
        processId: process.id,
        createdBy: user.userId,
        style: finalisedProcessStyle,
        contentJSON: getInitialContentForStyle(finalisedProcessStyle),
      },
    });

    await prisma.process.update({
      where: { id: process.id },
      data: {
        pendingVersionId: version.id,
      },
    });

    await createAuditLog({
      orgId: org.id,
      actorId: user.userId,
      action: "PROCESS_CREATED",
      entityType: "PROCESS",
      entityId: process.id,
      afterJSON: {
        id: process.id,
        title: process.title,
        description: process.description,
        slug: process.slug,
        style: process.style,
        status: process.status,
        teamId: process.teamId,
        categoryId: process.categoryId,
      },
    });

    return toActionState("SUCCESS", "Process created successfully", formData, {
      redirect: editProcessPath(departmentId, teamId, process.id),
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};
