import { homePath, onboardingPath, signInPath } from "@/app/paths";
import { Heading } from "@/components/ui/Heading";
import { PageContainer } from "@/components/ui/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { OrganizationOverview } from "@/features/settings/components/organization-overview";
import { getSessionContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const SettingsPage = async () => {
  const ctx = await getSessionContext();
  if (!ctx) redirect(signInPath());
  const { org, isAdmin } = ctx;
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(homePath());

  return (
    <PageContainer>
      <Heading
        title="Settings"
        description="Manage your organization's settings"
      />
      <Suspense fallback={<Skeleton />}>
        <OrganizationOverview org={org} />
      </Suspense>
    </PageContainer>
  );
};

export default SettingsPage;
