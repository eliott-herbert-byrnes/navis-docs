"use server";

import { prisma } from "@/lib/prisma";
import { isSelfHosted } from "@/lib/deploy-mode";
import { OrgPlan } from "@prisma/client";

export type OrgProvisioning = {
  allowedDepartments: number;
  allowedTeamsPerDepartment: number;
  currentDepartments: number;
  currentTeams: number;
};

function numFromEnt(
  ent: Record<string, unknown>,
  keys: string[],
): number | undefined {
  for (const key of keys) {
    const v = ent[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v !== "") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

export const getStripeProvisionByOrg = async (
  orgSlug: string,
): Promise<OrgProvisioning> => {
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true, plan: true, entitlementsJSON: true },
  });

  if (!org) {
    return {
      allowedDepartments: 0,
      allowedTeamsPerDepartment: 0,
      currentDepartments: 0,
      currentTeams: 0,
    };
  }

  const [currentDepartments, currentTeams] = await prisma.$transaction([
    prisma.department.count({ where: { orgId: org.id } }),
    prisma.team.count({ where: { department: { orgId: org.id } } }),
  ]);

  if (isSelfHosted()) {
    return {
      allowedDepartments: Infinity,
      allowedTeamsPerDepartment: Infinity,
      currentDepartments,
      currentTeams,
    };
  }

  if (org.plan === OrgPlan.free) {
    return {
      allowedDepartments: 0,
      allowedTeamsPerDepartment: 0,
      currentDepartments,
      currentTeams,
    };
  }

  const defaults = {
    pro: {
      procedures: 2000,
      departments: 500,
      teamsPerDepartment: 100,
    },
    enterprise: {
      procedures: Infinity,
      departments: Infinity,
      teamsPerDepartment: Infinity,
    },
  } as const;

  const planKey = (org.plan || "pro").toLowerCase() as "pro" | "enterprise";
  const ent =
    typeof org.entitlementsJSON === "object" && org.entitlementsJSON !== null
      ? (org.entitlementsJSON as Record<string, unknown>)
      : {};

  const allowedDepartments =
    numFromEnt(ent, ["allowedDepartments", "maxDepartments"]) ??
    defaults[planKey].departments;
  const allowedTeamsPerDepartment =
    numFromEnt(ent, ["allowedTeamsPerDepartment", "maxTeamsPerDepartment"]) ??
    defaults[planKey].teamsPerDepartment;

  return {
    allowedDepartments,
    allowedTeamsPerDepartment,
    currentDepartments,
    currentTeams,
  };
};
