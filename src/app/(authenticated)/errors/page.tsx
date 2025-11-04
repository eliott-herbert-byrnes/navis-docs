import { homePath, signInPath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { Spinner } from "@/components/ui/spinner";
import { ProcessErrorList } from "@/features/processes/components/error/components/process-error-list";
import { getErrors } from "@/features/processes/components/error/queries/get-errors";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type ErrorsPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

const ErrorsPage = async ({ searchParams }: ErrorsPageProps) => {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const isAdmin = await isOrgAdminOrOwner(user.userId);
  if (!isAdmin) redirect(homePath());

  const org = await getUserOrg(user.userId);
  if (!org) redirect(homePath());

  const params = await searchParams;
  const search = params.search;

  const errors = await getErrors(org.id, search);

  return (
    <>
      <Heading
        title="Error Reports"
        description="View and manage error reports for processes"
      />
      <Suspense fallback={<Spinner />} key={search}>
        <ProcessErrorList data={errors} />
      </Suspense>
    </>
  );
};

export default ErrorsPage;
