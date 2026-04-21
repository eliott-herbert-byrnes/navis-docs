import { Heading } from "@/components/ui/Heading";
import { CategoriesList } from "@/features/categories/components/categories-list";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { serverTrpc } from "@/server/trpc/server";
import { onboardingPath, dashboardPath } from "@/app/paths";
import { getSessionContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageContainer } from "@/components/ui/page-container";

const CategoriesPage = async () => {
  const ctx = await getSessionContext();
  const { org, isAdmin } = ctx ?? {};
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(dashboardPath());

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
