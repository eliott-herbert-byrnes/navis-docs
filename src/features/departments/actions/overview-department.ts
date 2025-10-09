"use server";
import { homePath } from "@/app/paths";
import { ActionState, fromErrorToActionState, toActionState } from "@/components/form/utils/to-action-state";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import z from "zod";

const nameSchema = z.string().min(1, { message: "Is Required" }).max(28);

const inputSchema = z.object({
    departmentName: nameSchema,
})

export const overviewDepartment = async (
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
            departmentName: String(formData.get("departmentName") ?? "").trim(),
        });
    
        const { departmentName } = parsed;
    
        const departmentId = String(formData.get("departmentId") ?? "");
    
        const department = await prisma.department.findFirst({
            where: { id: departmentId, orgId: org.id },
        });
    
        if (!department) {
            return toActionState("ERROR", "Department not found", formData);
        }

        const updatedDepartment = await prisma.department.update({
            where: { id: departmentId },
            data: { name: departmentName },
        });
    
        revalidatePath(homePath());
    
        return toActionState("SUCCESS", "Department updated successfully", formData, {
            department: updatedDepartment,
            isAdmin: isAdmin,
        });
        
    } catch (error) {
        return fromErrorToActionState(error, formData);
    }

};
