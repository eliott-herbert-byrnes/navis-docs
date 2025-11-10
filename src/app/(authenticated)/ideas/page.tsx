import { homePath, signInPath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { Spinner } from "@/components/ui/spinner";
import { IdeaList } from "@/features/processes/components/Idea/components/idea-list";
import { getOrgIdeas } from "@/features/processes/components/Idea/queries/get-ideas";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type IdeasPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

const IdeasPage = async ({ searchParams }: IdeasPageProps) => {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const isAdmin = await isOrgAdminOrOwner(user.userId);
  if (!isAdmin) redirect(homePath());

  const org = await getUserOrg(user.userId);
  if (!org) redirect(homePath());

  const params = await searchParams;
  const search = params.search;

  const ideas = await getOrgIdeas(org.id, search);

  return (
    <>
      <Heading
        title="Ideas"
        description="View and manage ideas for this organization"
      />
      <Suspense fallback={<Spinner />} key={search}>
        <IdeaList data={ideas} />
      </Suspense>
    </>
  );
};

export default IdeasPage;
