import { homePath, onboardingPath, signInPath } from "@/app/paths";
import { Heading } from "@/components/ui/Heading";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { PageContainer } from "@/components/ui/page-container";
import { IdeaList } from "@/features/procedures/components/Idea/components/idea-list";
import { getSessionContext } from "@/lib/auth";
import { serverTrpc } from "@/server/trpc/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type IdeasPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

const IdeasPage = async ({ searchParams }: IdeasPageProps) => {
  const ctx = await getSessionContext();
  if (!ctx) redirect(signInPath());
  const { org, isAdmin } = ctx;
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(homePath());

  const params = await searchParams;
  const search = params.search;

  const trpc = await serverTrpc();
  const { data: ideas } = await trpc.ideas.getOrgIdeas({ search });

  return (
    <>
      <PageContainer>

        <Heading
          title="Ideas"
          description="View and manage ideas for this organization"
        />
        <Suspense fallback={<ListSkeleton />} key={search}>
          <IdeaList data={ideas} />
        </Suspense>
      </PageContainer>
    </>
  );
};

export default IdeasPage;
