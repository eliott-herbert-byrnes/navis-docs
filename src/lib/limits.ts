import { prisma } from "./prisma";

export async function assertOrgLimit(
  orgId: string,
  kind: "department" | "team" | "process"
) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  });
  if (!org) {
    throw new Error("Organization not found");
  }

  const ent = org.entitlementsJSON as any;

  if (kind === "department" && ent.maxDepartments !== null) {
    const count = await prisma.department.count({
      where: {
        orgId,
      },
    });
    if (count >= ent.maxDepartments) {
      throw new Error("Maximum number of departments reached");
    }
  } else if (kind === "team" && ent.maxTeamsPerDepartment !== null) {
    const count = await prisma.team.count({
      where: {
        department: { orgId },
      },
    });
    if (count >= ent.maxTeamsPerDepartment) {
      throw new Error("Maximum number of teams per department reached");
    }
  } else if (kind === "process" && ent.maxProcesses !== null) {
    const count = await prisma.process.count({
      where: {
        team: { department: { orgId } },
      },
    });
    if (count >= ent.maxTeamsPerDepartment) {
      throw new Error("Maximum number of processes reached");
    }
  }
}
