"use server";

import { homePath } from "@/app/paths";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { createAuditLog } from "@/features/audit/utils/audit";
import { getStripeProvisionByOrg } from "@/features/stripe/queries/get-stripe-provisioning";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLimiter, getLimitByUser } from "@/lib/rate-limiter";
import { revalidatePath } from "next/cache";
import z from "zod";

const nameSchema = z.string().min(1, { message: "Is Required" }).max(28);
const optionalNameSchema = z.string().max(191);

const inputSchema = z.object({
  departmentName: nameSchema,
  teamName1: nameSchema,
  teamName2: optionalNameSchema,
  teamName3: optionalNameSchema,
});

export const createDepartment = async (
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
      "department-create"
    );
    if (!success) {
      return toActionState("ERROR", "Too many requests", formData);
    }
    const org = await getUserOrg(user.userId);

    if (!org) {
      return toActionState("ERROR", "No organization found", formData);
    }

    const isAdmin = await isOrgAdminOrOwner(user.userId);
    if (!isAdmin) {
      return toActionState("ERROR", "Forbidden", formData);
    }

    const mem = await prisma.orgMembership.findFirst({
      where: {
        orgId: org.id,
        userId: user.userId,
      },
    });

    if (!mem || !["OWNER", "ADMIN"].includes(mem.role)) {
      return toActionState("ERROR", "Forbidden", formData);
    }

    const parsed = inputSchema.parse({
      departmentName: String(formData.get("departmentName") ?? "").trim(),
      teamName1: String(formData.get("teamName1") ?? "").trim(),
      teamName2: String(formData.get("teamName2") ?? "").trim(),
      teamName3: String(formData.get("teamName3") ?? "").trim(),
    });

    const { departmentName, teamName1, teamName2, teamName3 } = parsed;

    const existingDepartment = await prisma.department.findFirst({
      where: {
        orgId: org.id,
        name: departmentName,
      },
    });

    if (existingDepartment) {
      return toActionState("ERROR", "Department already exists", formData);
    }

    const {
      allowedDepartments,
      currentDepartments,
      allowedTeamsPerDepartment,
    } = await getStripeProvisionByOrg(org.slug);

    if (currentDepartments >= allowedDepartments) {
      return toActionState(
        "ERROR",
        "You have reached the maximum number of departments",
        formData
      );
    }

    const department = await prisma.department.create({
      data: {
        orgId: org.id,
        name: departmentName,
      },
    });

    await createAuditLog({
      orgId: org.id,
      actorId: user.userId,
      action: "DEPARTMENT_CREATED",
      entityType: "DEPARTMENT",
      entityId: department.id,
      afterJSON: {
        id: department.id,
        name: departmentName,
      },
    });

    const teamNames = [teamName1, teamName2, teamName3].filter(
      (value) => value.trim().length > 0
    );

    if (teamNames.length > allowedTeamsPerDepartment) {
      return toActionState(
        "ERROR",
        "You have reached the maximum number of teams per department",
        formData
      );
    }

    for (const teamName of teamNames) {
      const team = await prisma.team.create({
        data: {
          name: teamName,
          departmentId: department.id,
        },
      });

      await createAuditLog({
        orgId: org.id,
        actorId: user.userId,
        action: "TEAM_CREATED",
        entityType: "TEAM",
        entityId: department.id,
        afterJSON: {
          id: team.id,
          name: team.name,
          departmentId: department.id,
        },
      });
    }

    revalidatePath(homePath());

    return toActionState(
      "SUCCESS",
      "Department created successfully",
      formData,
      {
        department,
      }
    );
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};
