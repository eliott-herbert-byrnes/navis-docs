import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { onboardingPath, signInPath, teamProcessPath } from "@/app/paths";
import { NewsCreateForm } from "@/features/news/components/news-create-form";
import { getDepartments } from "@/features/departments/queries/get-departments";

export default async function NewsCreatePage({
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

  const { list: departments } = await getDepartments(org.id);

  const teamName = departments
    .find((department) => department.id === departmentId)
    ?.teams.find((team) => team.id === teamId)?.name;

  return (
    <>
      <Heading
        title={`Create News`}
        description="Create a new news post"
      />
      <Suspense fallback={<Spinner />}>
        <NewsCreateForm 
        teamName={teamName ?? "this team"}
        departmentId={departmentId}
        teamId={teamId}
        />
      </Suspense>
    </>
  );
}
