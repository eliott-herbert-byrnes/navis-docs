import { Heading } from "@/components/ui/Heading";
import { getSessionContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { departmentsPath, onboardingPath, signInPath } from "../paths";
import { getDashboardStats } from "@/features/dashboard/queries/dashboard-stats";
import { getProcedureChartData } from "@/features/dashboard/queries/procedure-chart-data";
import { DashboardStatCards } from "@/features/dashboard/components/dashboard-stat-card";
import { DashboardAuditStream } from "@/features/dashboard/components/dashboard-audit-stream";
import { DashboardProcedureChart } from "@/features/dashboard/components/dashoard-procedure-chart";
import { PageContainer } from "@/components/ui/page-container";
import { DashboardActionsDropdown } from "@/features/dashboard/components/dashboard-actions-dropdown";

export default async function Home() {
  const ctx = await getSessionContext();
  if (!ctx) redirect(signInPath());
  const { org, isAdmin } = ctx;
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

        <div className="space-y-4">
          <DashboardStatCards stats={stats} />
          <DashboardProcedureChart data={chartData} />
          <div>
            <h2 className="text-sm font-semibold mb-4">Recent Activity</h2>
            <Suspense fallback={<Skeleton className="h-48" />}>
              <DashboardAuditStream />
            </Suspense>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
