import { Heading } from "@/components/ui/Heading";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { getSessionContext } from "@/lib/auth";
import { serverTrpc } from "@/server/trpc/server";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { homePath } from "@/app/paths";
import { ImportProcedurePage } from "@/features/import/components/import-procedure-page";

const ProcedureImportPage = async () => {
  const ctx = await getSessionContext();
  const { org, isAdmin } = ctx ?? {};
  if (!org || !isAdmin) {
    redirect(homePath());
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
