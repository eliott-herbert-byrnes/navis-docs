import { Heading } from "@/components/ui/Heading";
import { CategoriesList } from "@/features/categories/components/categories-list";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { serverTrpc } from "@/server/trpc/server";
import { onboardingPath, homePath } from "@/app/paths";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageContainer } from "@/components/ui/page-container";

const CategoriesPage = async () => {
  const user = await getSessionUser();
  const { org, isAdmin } = await getUserOrgWithRole(user?.userId ?? "");
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(homePath());

  const trpc = await serverTrpc();
  const categoryResult = await trpc.categories.getCategoriesForList({
    search: "",
    limit: 10,
    offset: 0,
  });

  const data = categoryResult;

  return (
    <>
      <PageContainer>
        <Heading
          title="Categories"
          description="View and manage categories for your organization"
        />

        <Suspense fallback={<ListSkeleton />}>
          <CategoriesList data={data?.categories ?? []} />
        </Suspense>
      </PageContainer>
    </>
  );
};

export default CategoriesPage;
