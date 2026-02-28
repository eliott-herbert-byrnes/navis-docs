"use client";

import { Heading } from "@/components/ui/Heading";
import { ProcedureList } from "@/features/procedure-base/components/procedure-list";
import { trpc } from "@/trpc/client";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { ExportProcedureOrgDataButton } from "@/features/settings/components/export-procedure-org-data-button";
import { ProcedureImportButton } from "@/features/procedure-base/components/procedure-import-button";

const ProcedureBasePage = () => {
  const { data, isLoading } = trpc.procedures.getProceduresForBase.useQuery({
    search: "",
    limit: 10,
    offset: 0,
  });

  return (
    <>
      <Heading
        title="Procedures"
        description="View and manage procedures for your organization"
        actions={
          <div className="flex flex-col gap-2">
            <ExportProcedureOrgDataButton />
            {/* Disabled for MVP */}
            {/* <ProcedureImportButton /> */}
          </div>
        }
      />

      {isLoading ? (
        <ListSkeleton />
      ) : (
        <ProcedureList data={data?.procedures ?? []} />
      )}
    </>
  );
};

export default ProcedureBasePage;
