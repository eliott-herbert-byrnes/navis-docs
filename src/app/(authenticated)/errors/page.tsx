import { dashboardPath, onboardingPath } from "@/app/paths";
import { Heading } from "@/components/ui/Heading";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { PageContainer } from "@/components/ui/page-container";
import { ProcedureErrorList } from "@/features/procedures/components/error/components/procedure-error-list";
import { getSessionContext } from "@/lib/auth";
import { serverTrpc } from "@/server/trpc/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type ErrorsPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

const ErrorsPage = async ({ searchParams }: ErrorsPageProps) => {
  const ctx = await getSessionContext();
  const { org, isAdmin } = ctx ?? {};
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(dashboardPath());

  const params = await searchParams;
  const search = params.search;

  const trpc = await serverTrpc();
  const { data: errors } = await trpc.errors.getErrors({ search });

  return (
    <>
      <PageContainer>
        <Heading
          title="Error Reports"
          description="View and manage error reports for procedures"
        />
        <Suspense fallback={<ListSkeleton />} key={search}>
          <ProcedureErrorList data={errors} />
        </Suspense>
      </PageContainer>
    </>
  );
};

export default ErrorsPage;
