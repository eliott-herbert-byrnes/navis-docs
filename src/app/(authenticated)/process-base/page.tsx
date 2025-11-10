import { homePath, signInPath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { Spinner } from "@/components/ui/spinner";
import { ProcessList } from "@/features/process-base/components/process-list";
import { getProcesses } from "@/features/process-base/queries/get-processes";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type ProcessBasePageProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

const ProcessBasePage = async ({ searchParams }: ProcessBasePageProps) => {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const {org, isAdmin} = await getUserOrgWithRole(user.userId);
  if (!org || !isAdmin) redirect(homePath());

  const params = await searchParams;
  const search = params.search;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const { processes} = await getProcesses({
    orgId: org.id,
    search,
    limit,
    offset,
  });

  return (
    <>
      <Heading
        title="Processbase"
        description="View and manage processes for your organization"
      />
      <Suspense fallback={<Spinner />} key={search}>
        <ProcessList 
          data={processes} 
        />
      </Suspense>
    </>
  );
};

export default ProcessBasePage;
