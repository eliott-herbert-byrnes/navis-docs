"use server";

import { homePath } from "@/app/paths";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getSessionUser, getUserOrg, getUserOrgWithRole, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteLimiter, getLimitByUser } from "@/lib/rate-limiter";
import { revalidatePath } from "next/cache";
import {z} from "zod";

const inputSchema = z.object({
    departmentId: z.string().min(1, { message: "Invalid department" }),
    teamName: z.string().min(1, { message: "Invalid team" }),
  });

export const deleteTeam = async (
  _actionState: ActionState,
  formData: FormData,
) => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized", formData);
    }

    const { success } = await getLimitByUser(
      deleteLimiter,
      user.userId,
      "team-delete"
    );
    if (!success) {
      return toActionState("ERROR", "Too many requests", formData);
    }

    const {org, isAdmin} = await getUserOrgWithRole(user.userId);
    if (!org || !isAdmin) {
      return toActionState("ERROR", "Forbidden", formData);
    }

    const { departmentId, teamName } = inputSchema.parse({
        departmentId: String(formData.get("departmentId")),
        teamName: String(formData.get("teamName")),
    });

    const department = await prisma.department.findFirst({
        where: {id: departmentId, orgId: org.id},
    })
    if (!department) {
        return toActionState("ERROR", "Department not found", formData);
    }

    const team = await prisma.team.findFirst({
        where: {departmentId: department.id, name: teamName},
    })
    if (!team) {
        return toActionState("ERROR", "Team not found", formData);
    }

    const deleted = await prisma.team.delete({
        where: {id: team.id},
    })

    revalidatePath(homePath());
    
    return toActionState(
        "SUCCESS",
        "Team deleted successfully",
        formData,
        {
            team: deleted,
      }
    );
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};
