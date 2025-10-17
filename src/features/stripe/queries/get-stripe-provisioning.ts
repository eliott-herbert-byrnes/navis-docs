"use server";

import {prisma} from "@/lib/prisma";

export type OrgProvisioning = {
  allowedDepartments: number;
  allowedTeamsPerDepartment: number;
  currentDepartments: number;
  currentTeams: number;
}

// TODO: Add Process provisions once processes are implemented

export const getStripeProvisionByOrg = async (orgSlug: string): Promise<OrgProvisioning> => {


  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: {id: true, plan: true, entitlementsJSON: true}
  })

  if (!org){
    return {
      allowedDepartments: 0,
      allowedTeamsPerDepartment: 0,
      currentDepartments: 0,
      currentTeams: 0,
    }
  }

  const defaults = {
    business: {processes: 100, departments: 3, teamsPerDepartment: 1},
    enterprise: {processes: 1000, departments: 1000, teamsPerDepartment: 1000},
  } as const;

  const planKey = (org.plan || "business").toLowerCase() as "business" | "enterprise";
  const ent = typeof org.entitlementsJSON === "object" && org.entitlementsJSON !== null ? org.entitlementsJSON as Record<string, unknown> : {};

  const allowedDepartments = Number(
    (typeof ent.maxDepartments === "number" || typeof ent.maxDepartments === "string") 
      ? ent.maxDepartments 
      : defaults[planKey].departments
  );
  const allowedTeamsPerDepartment = Number(
    (typeof ent.maxTeamsPerDepartment === "number" || typeof ent.maxTeamsPerDepartment === "string")
      ? ent.maxTeamsPerDepartment
      : defaults[planKey].teamsPerDepartment
  );

  const [currentDepartments, currentTeams] =  await prisma.$transaction([
    prisma.department.count({ where: { orgId: org.id } }),
    prisma.team.count({ where: { department: { orgId: org.id } } }),
  ]);

  return {
    allowedDepartments,
    allowedTeamsPerDepartment,
    currentDepartments,
    currentTeams,
  };
};