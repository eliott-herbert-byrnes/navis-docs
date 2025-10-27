import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/empty-state";
import { onboardingPath, signInPath, teamProcessPath } from "@/app/paths";

export default async function ProcessCreatePage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const org = await getUserOrg(user.userId);
  if (!org) redirect(onboardingPath());

  const isAdmin = user ? await isOrgAdminOrOwner(user.userId) : false;
  if (!isAdmin) redirect(teamProcessPath(departmentId, teamId));

  return (
    <>
      <Heading
        title={`Create Process`}
        description="Create a new process and add a category"
      />
      <Suspense fallback={<Spinner />}>
        <EmptyState
          title="No processes found"
          body="Create a new process to get started"
        />
      </Suspense>
    </>
  );
}
