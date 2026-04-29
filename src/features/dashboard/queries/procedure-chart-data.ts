import { prisma } from "@/lib/prisma";
import { applyOrgDashboardCachePolicy } from "@/lib/org-dashboard-cache";
import { subMonths, startOfMonth, format } from "date-fns";

export type ProcedureChartData = { month: string; count: number }[];

export async function getProcedureChartData(
  orgId: string,
): Promise<ProcedureChartData> {
  "use cache";
  applyOrgDashboardCachePolicy(orgId);

  const sixMonthsAgo = subMonths(new Date(), 6);

  const procedures = await prisma.procedure.findMany({
    where: {
      team: { department: { orgId } },
      createdAt: { gte: sixMonthsAgo },
    },
    select: { createdAt: true },
  });

  const months: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const label = format(startOfMonth(subMonths(new Date(), i)), "MMM yyyy");
    months[label] = 0;
  }

  for (const p of procedures) {
    const label = format(startOfMonth(p.createdAt), "MMM yyyy");
    if (label in months) months[label]++;
  }

  return Object.entries(months).map(([month, count]) => ({ month, count }));
}