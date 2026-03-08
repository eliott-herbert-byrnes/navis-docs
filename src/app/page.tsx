import { Heading } from "@/components/ui/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { departmentsPath, onboardingPath } from "./paths";
import { getDashboardStats } from "@/features/dashboard/queries/dashboard-stats";
import { getProcedureChartData } from "@/features/dashboard/queries/procedure-chart-data";
import { DashboardStatCards } from "@/features/dashboard/components/dashboard-stat-card";
import { DashboardQuickLinks } from "@/features/dashboard/components/dashboard-quick-links";
import { DashboardAuditStream } from "@/features/dashboard/components/dashboard-audit-stream";
import { DashboardSubscriptionWidget } from "@/features/dashboard/components/dashboard-subscription-widget";
import { DashboardProcedureChart } from "@/features/dashboard/components/dashoard-procedure-chart";

export async function generateStaticParams() {
  return [{}];
}

export default async function Home() {
  const user = await getSessionUser();
  const { org, isAdmin } = await getUserOrgWithRole(user?.userId ?? "");

  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(departmentsPath());

  // Fetch all cached data in parallel — one round-trip per cache lifetime
  const [stats, chartData] = await Promise.all([
    getDashboardStats(org.id),
    getProcedureChartData(org.id),
  ]);

  return (
    <>
      <Heading
        title="Dashboard"
        description="Organization overview at a glance"
      />

      <div className="space-y-6">
        {/* Stat cards */}
        <DashboardStatCards stats={stats} />

        {/* Quick links */}
        <div>
          <h2 className="text-sm font-semibold mb-3">Quick Links</h2>
          <DashboardQuickLinks
            openErrors={stats.openErrors}
            newIdeas={stats.newIdeas}
          />
        </div>

        {/* Chart + subscription side by side */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardProcedureChart data={chartData} />
          </div>
          <DashboardSubscriptionWidget org={org} />
        </div>

        {/* Live audit stream */}
        <div>
          <h2 className="text-sm font-semibold mb-3">Recent Activity</h2>
          <Suspense fallback={<Skeleton className="h-48" />}>
            <DashboardAuditStream />
          </Suspense>
        </div>
      </div>
    </>
  );
}
