import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { onboardingPath, signInPath, teamProcessPath } from "@/app/paths";
import { CreateProcessForm } from "@/features/processes/components/process-create-form";
import { getCategories } from "@/features/processes/queries/get-categories";

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

  const { list: categories } = await getCategories(teamId);

  return (
    <>
      <Heading
        title={`Create Process`}
        description="Create a new process and add a category"
      />
      <Suspense fallback={<Spinner />}>
        <CreateProcessForm 
        departmentId={departmentId}
        teamId={teamId}
        categories={categories}
        />
      </Suspense>
    </>
  );
}
