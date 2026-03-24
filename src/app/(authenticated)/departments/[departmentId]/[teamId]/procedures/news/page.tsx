import { Heading } from "@/components/ui/Heading";
import { getSessionContext, getUserById } from "@/lib/auth";
import { Suspense } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { NewsCreateButton } from "@/features/news/components/news-create-button";
import { NewsPostList } from "@/features/news/components/news-list";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  const ctx = await getSessionContext();
  const { isAdmin } = ctx ?? {};

  const trpc = await serverTrpc();
  const { list: departments } = await trpc.department.list();

  const teamName = departments
    .find((department) => department.id === departmentId)
    ?.teams.find((team) => team.id === teamId)?.name;

  const newsData = await trpc.news.getNews({ departmentId, teamId });
  const newsPosts = newsData.data;

  const uniqueUserIds = [...new Set(newsPosts.map((post) => post.createdBy))];
  const users = await Promise.all(
    uniqueUserIds.map((userId) => getUserById(userId ?? "")),
  );
  const userMap = Object.fromEntries(users.map((user) => [user?.id, user]));

  return (
    <>
      <Heading
        title={`${teamName} News`}
        description="View and manage news for your department"
        actions={isAdmin ? <NewsCreateButton /> : null}
      />
      <Suspense fallback={<Skeleton />}>
        {newsPosts.length > 0 ? (
          <NewsPostList userMap={userMap} />
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
