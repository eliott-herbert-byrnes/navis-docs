"use server";
import { homePath } from "@/app/paths";
import { ActionState, fromErrorToActionState, toActionState } from "@/components/form/utils/to-action-state";
import { getStripeProvisionByOrg } from "@/features/stripe/queries/get-stripe-provisioning";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import z from "zod";

const nameSchema = z.string().min(1, { message: "Is Required" }).max(28);

const inputSchema = z.object({
    teamName: nameSchema,
});

export const addTeam = async (_actionState: ActionState, formData: FormData) => {
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
        teamName: String(formData.get("teamName") ?? "").trim(),
    });
    
    const { teamName } = parsed;
    
    const departmentId = String(formData.get("departmentId") ?? "");
    
    const department = await prisma.department.findFirst({
        where: { id: departmentId, orgId: org.id },
    });
    
    if (!department) {
        return toActionState("ERROR", "Department not found", formData);
    }

    const existingTeam = await prisma.team.findFirst({
        where: { name: teamName, departmentId: department.id },
    });
    
    if (existingTeam) {
        return toActionState("ERROR", "Team already exists", formData);
    }

    const { allowedTeamsPerDepartment } = await getStripeProvisionByOrg(org.slug);
    
    const teamsInDept = await prisma.team.count({
        where: { departmentId: department.id },
    })

    if (teamsInDept >= allowedTeamsPerDepartment) {
        return toActionState("ERROR", "You have reached the maximum number of teams per department", formData);
    }
    
    const team = await prisma.team.create({
        data: { name: teamName, departmentId: department.id },
    });

    revalidatePath(homePath());

    return toActionState("SUCCESS", "Team added successfully", formData, {
        team,
        isAdmin: isAdmin,
    });

} catch (error) {
    return fromErrorToActionState(error, formData);
}
}