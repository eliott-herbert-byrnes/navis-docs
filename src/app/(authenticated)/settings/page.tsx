import { homePath, onboardingPath } from "@/app/paths";
import { Heading } from "@/components/ui/Heading";
import { Skeleton } from "@/components/ui/skeleton";
import { OrganizationOverview } from "@/features/settings/components/organization-overview";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const SettingsPage = async () => {
  const user = await getSessionUser();

  const { org, isAdmin } = await getUserOrgWithRole(user?.userId ?? "");
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(homePath());

  return (
    <>
      <Heading
        title="Settings"
        description="Manage your organization's settings"
      />
      <Suspense fallback={<Skeleton />}>
        <OrganizationOverview org={org} />
      </Suspense>
    </>
  );
};

export default SettingsPage;
