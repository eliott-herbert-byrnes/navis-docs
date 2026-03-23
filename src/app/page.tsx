import { Heading } from "@/components/ui/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { departmentsPath, onboardingPath, signInPath } from "./paths";
import { getDashboardStats } from "@/features/dashboard/queries/dashboard-stats";
import { getProcedureChartData } from "@/features/dashboard/queries/procedure-chart-data";
import { DashboardStatCards } from "@/features/dashboard/components/dashboard-stat-card";
import { DashboardAuditStream } from "@/features/dashboard/components/dashboard-audit-stream";
import { DashboardSubscriptionWidget } from "@/features/dashboard/components/dashboard-subscription-widget";
import { DashboardProcedureChart } from "@/features/dashboard/components/dashoard-procedure-chart";
import { PageContainer } from "@/components/ui/page-container";
import { DashboardActionsDropdown } from "@/features/dashboard/components/dashboard-actions-dropdown";

export async function generateStaticParams() {
  return [{}];
}

export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

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
      <PageContainer>

        <Heading
          title="Dashboard"
          description="Organization overview at a glance"
          actions={isAdmin ? <DashboardActionsDropdown /> : null}
        />

        <div className="space-y-6">
          {/* Stat cards */}
          <DashboardStatCards stats={stats} />

          {/* Chart + subscription side by side */}
          <DashboardProcedureChart data={chartData} />
          {/* </div> */}

          {/* Live audit stream */}
          <div>
            <h2 className="text-sm font-semibold mb-3">Recent Activity</h2>
            <Suspense fallback={<Skeleton className="h-48" />}>
              <DashboardAuditStream />
            </Suspense>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
