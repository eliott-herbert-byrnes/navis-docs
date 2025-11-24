import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signInPath, teamProcessPath } from "@/app/paths";
import { CreateProcessForm } from "@/features/processes/components/process-create-form";
import { getCategories } from "@/features/processes/queries/get-categories";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ProcessCreatePage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const {org, isAdmin} = await getUserOrgWithRole(user.userId);
  if (!org || !isAdmin) redirect(teamProcessPath(departmentId, teamId));

  const { list: categories } = await getCategories(teamId);

  return (
    <>
      <Heading
        title={`Create Process`}
        description="Create a new process and add a category"
      />
      <Suspense fallback={<Skeleton />}>
        <CreateProcessForm 
        departmentId={departmentId}
        teamId={teamId}
        categories={categories}
        />
      </Suspense>
    </>
  );
}
