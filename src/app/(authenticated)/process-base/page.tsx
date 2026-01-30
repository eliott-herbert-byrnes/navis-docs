"use client";

import { Heading } from "@/components/ui/Heading";
import { ProcessList } from "@/features/process-base/components/process-list";
import { trpc } from "@/trpc/client";
import { ListSkeleton } from "@/components/ui/list-skeleton";

const ProcessBasePage = () => {
  const { data, isLoading } = trpc.process.getProcessesForBase.useQuery({
    search: "",
    limit: 10,
    offset: 0,
  });

  return (
    <>
      <Heading
        title="Processbase"
        description="View and manage processes for your organization"
      />
      {isLoading ? (
        <ListSkeleton />
      ) : (
        <ProcessList data={data?.processes ?? []} />
      )}
    </>
  );
};

export default ProcessBasePage;
