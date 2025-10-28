import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { onboardingPath, signInPath, teamProcessPath } from "@/app/paths";
import { getCategories } from "@/features/processes/queries/get-categories";

export default async function ProcessEditPage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string; processId: string }>;
}) {
  const { departmentId, teamId, processId } = await params;

  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const org = await getUserOrg(user.userId);
  if (!org) redirect(onboardingPath());

  const isAdmin = user ? await isOrgAdminOrOwner(user.userId) : false;
  if (!isAdmin) redirect(teamProcessPath(departmentId, teamId));

  const { list: categories } = await getCategories(teamId);

  return (
    <>
      <Heading
        title={`Edit Process`}
        description="Edit a process and ship to documentation"
      />
      <Suspense fallback={<Spinner />}>
        <EditProcessForm 
        departmentId={departmentId}
        teamId={teamId}
        categories={categories}
        processId={processId}
        />
      </Suspense>
    </>
  );
}
