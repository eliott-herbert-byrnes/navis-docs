import { dashboardPath, onboardingPath, signInPath } from "@/app/paths";
import { DemoNotAvailable } from "@/components/demo/not-available";
import { Heading } from "@/components/ui/Heading";
import { PageContainer } from "@/components/ui/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { AiConfiguration } from "@/features/settings/components/ai-configuration";
import { OrganizationOverview } from "@/features/settings/components/organization-overview";
import { getSessionContext } from "@/lib/auth";
import { isDemoContext } from "@/lib/demo";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function OrganizationOverviewSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

const SettingsPage = async () => {
  if (await isDemoContext()) {
    return <DemoNotAvailable feature="Settings" />;
  }

  const ctx = await getSessionContext();
  if (!ctx) redirect(signInPath());
  const { org, isAdmin } = ctx;
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(dashboardPath());

  return (
    <PageContainer>
      <Heading
        title="Settings"
        description="Manage your organization's settings"
      />
      <Suspense fallback={<OrganizationOverviewSkeleton />}>
        <AiConfiguration />
        <OrganizationOverview org={org} />
      </Suspense>
    </PageContainer>
  );
};

export default SettingsPage;
