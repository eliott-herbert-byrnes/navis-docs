import { homePath, onboardingPath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { ListSkeleton } from "@/components/list-skeleton";
import { ProcessErrorList } from "@/features/processes/components/error/components/process-error-list";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { serverTrpc } from "@/server/trpc/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type ErrorsPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

const ErrorsPage = async ({ searchParams }: ErrorsPageProps) => {
  const user = await getSessionUser();

  const { org, isAdmin } = await getUserOrgWithRole(user?.userId ?? "");
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(homePath());

  const params = await searchParams;
  const search = params.search;

  const trpc = await serverTrpc();
  const { data: errors } = await trpc.errors.getErrors({ search });

  return (
    <>
      <Heading
        title="Error Reports"
        description="View and manage error reports for processes"
      />
      <Suspense fallback={<ListSkeleton />} key={search}>
        <ProcessErrorList data={errors} />
      </Suspense>
    </>
  );
};

export default ErrorsPage;
