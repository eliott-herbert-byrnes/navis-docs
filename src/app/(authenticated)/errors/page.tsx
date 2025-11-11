import { onboardingPath, signInPath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { Spinner } from "@/components/ui/spinner";
import { ProcessErrorList } from "@/features/processes/components/error/components/process-error-list";
import { getErrors } from "@/features/processes/components/error/queries/get-errors";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
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

  const {org, isAdmin} = await getUserOrgWithRole(user.userId);
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(signInPath());

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
