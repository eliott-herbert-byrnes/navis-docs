import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { ProcessBreadcrumbs } from "../_navigation";
import { NewsCreateButton } from "@/features/news/components/news-create-button";
import { NewsPostList } from "@/features/news/components/news-list";
import { getNewsPosts } from "@/features/news/queries/get-news-posts";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  const user = await getSessionUser();

  const { isAdmin } = await getUserOrgWithRole(user?.userId ?? "");

  const trpc = await serverTrpc();
  const { list: departments } = await trpc.department.list();

  const departmentName = departments.find(
    (department) => department.id === departmentId,
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
      <Suspense fallback={<Skeleton />}>
        {newsPosts.length > 0 ? (
          <NewsPostList departmentId={departmentId} teamId={teamId} />
        ) : (
          <EmptyState
            title="No news posts yet"
            body="Create a news post to get started"
          />
        )}
      </Suspense>
    </>
  );
}
