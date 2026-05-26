import { Heading } from "@/components/ui/Heading";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { isAiEnabled } from "@/lib/ai/ai-enabled";
import { getSessionContext } from "@/lib/auth";
import { serverTrpc } from "@/server/trpc/server";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dashboardPath } from "@/app/paths";
import { ImportProcedurePage } from "@/features/import/components/import-procedure-page";

const ProcedureImportPage = async () => {
  if (!isAiEnabled()) {
    redirect(dashboardPath());
  }

  const ctx = await getSessionContext();
  const { org, isAdmin } = ctx ?? {};
  if (!org || !isAdmin) {
    redirect(dashboardPath());
  }

  const trpc = await serverTrpc();
  const { list: departments } = await trpc.department.list();

  return (
    <>
      <Heading
        title="Import Procedure"
        description="Import procedures to a specified department"
      />
      <Suspense fallback={<ListSkeleton />}>
        <ImportProcedurePage departments={departments} />
      </Suspense>
    </>
  );
};

export default ProcedureImportPage;
