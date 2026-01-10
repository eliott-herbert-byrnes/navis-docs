import { homePath, onboardingPath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { ListSkeleton } from "@/components/list-skeleton";
import { IdeaList } from "@/features/processes/components/Idea/components/idea-list";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { serverTrpc } from "@/server/trpc/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type IdeasPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

const IdeasPage = async ({ searchParams }: IdeasPageProps) => {
  const user = await getSessionUser();
  const {org, isAdmin} = await getUserOrgWithRole(user?.userId ?? "");
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(homePath());

  const params = await searchParams;
  const search = params.search;

  const trpc = await serverTrpc();
  const { data: ideas } = await trpc.ideas.getOrgIdeas({search})

  return (
    <>
      <Heading
        title="Ideas"
        description="View and manage ideas for this organization"
      />
      <Suspense fallback={<ListSkeleton />} key={search}>
        <IdeaList data={ideas} />
      </Suspense>
    </>
  );
};

export default IdeasPage;
