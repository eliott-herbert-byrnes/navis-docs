import { onboardingPath, signInPath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { Spinner } from "@/components/ui/spinner";
import { OrganizationOverview } from "@/features/settings/components/organization-overview";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const SettingsPage = async () => {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const {org, isAdmin} = await getUserOrgWithRole(user.userId);
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(signInPath()); 

  return (
    <>
      <Heading
        title="Settings"
        description="Manage your organization's settings"
      />
      <Suspense fallback={<Spinner />}>
      <OrganizationOverview org={org}/>
      </Suspense>
    </>
  );
};

export default SettingsPage;
