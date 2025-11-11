import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/empty-state";
import { signInPath, teamProcessPath } from "@/app/paths";
import { getDepartments } from "@/features/departments/queries/get-departments";
import { ProcessBreadcrumbs } from "../_navigation";
import { NewsCreateButton } from "@/features/news/components/news-create-button";
import { NewsPostList } from "@/features/news/components/news-list";
import { getNewsPosts } from "@/features/news/queries/get-news-posts";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const {org, isAdmin} = await getUserOrgWithRole(user.userId);
  if (!org) redirect(teamProcessPath(departmentId, teamId));

  const { list: departments } = await getDepartments(org.id);

  const departmentName = departments.find(
    (department) => department.id === departmentId
  )?.name;

  const teamName = departments
    .find((department) => department.id === departmentId)
    ?.teams.find((team) => team.id === teamId)?.name;

  const newsPosts = await getNewsPosts(departmentId, teamId);

  return (
    <>
      <Heading
        title={`${teamName} News`}
        actions={
          isAdmin ? (
            <NewsCreateButton
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
      {newsPosts.length > 0 ? (
        <NewsPostList departmentId={departmentId} teamId={teamId} />
      ) : (
        <EmptyState title="No news posts yet" body="Create a news post to get started" />
      )}
      </Suspense>
    </>
  );
}
