import { Heading } from "@/components/ui/Heading";
import { ProcedureList } from "@/features/procedure-base/components/procedure-list";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { ExportProcedureOrgDataButton } from "@/features/settings/components/export-procedure-org-data-button";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { onboardingPath, homePath, procedureBaseCreatePath } from "@/app/paths";
import { redirect } from "next/navigation";
import { serverTrpc } from "@/server/trpc/server";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

const ProcedureBasePage = async () => {
  const user = await getSessionUser();
  const { org, isAdmin } = await getUserOrgWithRole(user?.userId ?? "");
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(homePath());

  const trpc = await serverTrpc();
  const proceduresResult = await trpc.procedures.getProceduresForBase({
    search: "",
    limit: 10,
    offset: 0,
  });
  const data = proceduresResult;

  const createProcedureButton = (
            <Link href={procedureBaseCreatePath()}>
              <Button variant="outline">
                <PlusIcon className="w-4 h-4" />
                Create Procedure
              </Button>
            </Link>
  )

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
            {createProcedureButton}
          </div>
        }
      />

      <Suspense fallback={<ListSkeleton />}>
        <ProcedureList initialData={data} />
      </Suspense>
    </>
  );
};

export default ProcedureBasePage;
