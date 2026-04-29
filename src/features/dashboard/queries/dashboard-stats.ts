import { prisma } from "@/lib/prisma";
import { applyOrgDashboardCachePolicy } from "@/lib/org-dashboard-cache";

export type DashboardStats = {
  totalUsers: number;
  nonCompliantUsers: number;
  totalDepartments: number;
  totalProcedures: number;
  openErrors: number;
  newIdeas: number;
};

export async function getDashboardStats(orgId: string): Promise<DashboardStats> {
  "use cache";
  applyOrgDashboardCachePolicy(orgId);

  const [
    totalUsers,
    nonCompliantUsers,
    totalDepartments,
    totalProcedures,
    openErrors,
    newIdeas,
  ] = await prisma.$transaction([
    prisma.orgMembership.count({ where: { orgId } }),
    prisma.orgMembership.count({ where: { orgId, compliant: false } }),
    prisma.department.count({ where: { orgId } }),
    prisma.procedure.count({
      where: { team: { department: { orgId } } },
    }),
    prisma.errorReport.count({
      where: {
        status: "OPEN",
        procedure: { team: { department: { orgId } } },
      },
    }),
    prisma.idea.count({
      where: {
        status: "NEW",
        team: { department: { orgId } },
      },
    }),
  ]);

  return {
    totalUsers,
    nonCompliantUsers,
    totalDepartments,
    totalProcedures,
    openErrors,
    newIdeas,
  };
}