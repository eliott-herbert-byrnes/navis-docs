"use server";

import { homePath } from "@/app/paths";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inputSchema = z.object({
  departmentId: z.string().min(1, { message: "Invalid department" }),
  oldTeamName: z.string().min(1, { message: "Invalid team" }),
  newTeamName: z.string().min(1, { message: "New team name is required" }).max(28),
});

export const renameTeam = async (
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

    const { departmentId, oldTeamName, newTeamName } = inputSchema.parse({
      departmentId: String(formData.get("departmentId")),
      oldTeamName: String(formData.get("oldTeamName")),
      newTeamName: String(formData.get("newTeamName")),
    });

    const department = await prisma.department.findFirst({
      where: { id: departmentId, orgId: org.id },
    });
    if (!department) {
      return toActionState("ERROR", "Department not found", formData);
    }

    const team = await prisma.team.findFirst({
      where: { departmentId: department.id, name: oldTeamName },
    });
    if (!team) {
      return toActionState("ERROR", "Team not found", formData);
    }

    const existingTeam = await prisma.team.findFirst({
      where: { departmentId: department.id, name: newTeamName, id: { not: team.id } },
    });
    if (existingTeam) {
      return toActionState("ERROR", "Team with this name already exists", formData);
    }

    const updated = await prisma.team.update({
      where: { id: team.id },
      data: { name: newTeamName },
    });

    revalidatePath(homePath());

    return toActionState("SUCCESS", "Team renamed successfully", formData, {
      team: updated,
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};
