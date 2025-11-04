import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/empty-state";
import { onboardingPath, signInPath } from "@/app/paths";
import { getDepartments } from "@/features/departments/queries/get-departments";
import { ProcessBreadcrumbs } from "./_navigation";
import { ProcessCreateButton } from "@/features/processes/components/process-create-button";
import { FavoriteList } from "@/features/processes/components/favorite/components/favorite-list";

export default async function ProcessPage({
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

  const { list: departments } = await getDepartments(org.id);

  const departmentName = departments.find(
    (department) => department.id === departmentId
  )?.name;

  const teamName = departments
    .find((department) => department.id === departmentId)
    ?.teams.find((team) => team.id === teamId)?.name;

  return (
    <>
      <Heading
        title={`${teamName} Docs`}
        actions={
          isAdmin ? (
            <ProcessCreateButton
              departmentId={departmentId}
              teamId={teamId}
              isAdmin={isAdmin}
            />
          ) : null
        }
        breadcrumbs={
          <ProcessBreadcrumbs
            teamName={teamName}
            departmentName={departmentName}
          />
        }
      />
      <Suspense fallback={<Spinner />}>
        <FavoriteList departmentId={departmentId} teamId={teamId} />
      </Suspense>
    </>
  );
}
