import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { signInPath, teamProcessPath } from "@/app/paths";
import { NewsCreateForm } from "@/features/news/components/news-create-form";
import { getCachedDepartments } from "@/lib/cache-queries";

export default async function NewsCreatePage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const {org, isAdmin} = await getUserOrgWithRole(user.userId);
  if (!org || !isAdmin) redirect(teamProcessPath(departmentId, teamId));

  const { list: departments } = await getCachedDepartments(org.id);

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
