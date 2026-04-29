import { DemoNotAvailable } from "@/components/demo/not-available";
import { getSessionContext } from "@/lib/auth";
import { isDemoContext } from "@/lib/demo";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { teamProcedurePath } from "@/app/paths";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";
import { EditProcedurePageClient } from "./edit-procedure-page-client";

function EditProcedureFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default async function ProcedureEditPage({
  params,
}: {
  params: Promise<{
    departmentId: string;
    teamId: string;
    procedureId: string;
  }>;
}) {
  const { departmentId, teamId, procedureId } = await params;

  if (await isDemoContext()) {
    return <DemoNotAvailable feature="Procedure editing" />;
  }

  const ctx = await getSessionContext();
  const { org, isAdmin } = ctx ?? {};
  if (!org || !isAdmin) redirect(teamProcedurePath(departmentId, teamId));

  const trpc = await serverTrpc();
  const { data: procedure } = await trpc.procedures.getForEdit({ procedureId });

  if (!procedure) {
    redirect(teamProcedurePath(departmentId, teamId));
  }

  return (
    <Suspense fallback={<EditProcedureFormSkeleton />}>
      <EditProcedurePageClient
        procedureId={procedureId}
        procedure={procedure}
      />
    </Suspense>
  );
}
