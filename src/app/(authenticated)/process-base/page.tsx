import { homePath, signInPath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { Spinner } from "@/components/ui/spinner";
import { ProcessList } from "@/features/process-base/components/process-list";
import { getProcesses } from "@/features/process-base/queries/get-processes";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type ProcessBasePageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

const ProcessBasePage = async ({ searchParams }: ProcessBasePageProps) => {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const isAdmin = await isOrgAdminOrOwner(user.userId);
  if (!isAdmin) redirect(homePath());

  const org = await getUserOrg(user.userId);
  if (!org) redirect(homePath());

  const params = await searchParams;
  const search = params.search;

  const processes = await getProcesses(org.id, search);

  return (
    <>
      <Heading
        title="Processbase"
        description="View and manage processes for your organization"
      />
      <Suspense fallback={<Spinner />} key={search}>
        <ProcessList data={processes} />
      </Suspense>
    </>
  );
};

export default ProcessBasePage;
