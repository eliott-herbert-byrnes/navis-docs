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
import {z} from "zod";

const inputSchema = z.object({
    departmentId: z.string().min(1, { message: "Invalid department" }),
  });

export const deleteDepartment = async (
  _actionState: ActionState,
  formData: FormData,
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

    const { departmentId } = inputSchema.parse({
      departmentId: String(formData.get("departmentId")),
    });

    const department = await prisma.department.findFirst({
        where: {id: departmentId, orgId: org.id},
    })
    if (!department) {
        return toActionState("ERROR", "Department not found", formData);
    }

    const deleted = await prisma.department.delete({
        where: {id: departmentId},
    })

    revalidatePath(homePath());
    
    return toActionState(
        "SUCCESS",
        "Department deleted successfully",
        formData,
        {
            department: deleted,
            isAdmin: isAdmin,
      }
    );
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};
