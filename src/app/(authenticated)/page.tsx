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

function DashboardAuditStreamSkeleton() {
  return (
    <div className="space-y-3 rounded-md border p-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

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
            <Suspense fallback={<DashboardAuditStreamSkeleton />}>
              <DashboardAuditStream />
            </Suspense>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
