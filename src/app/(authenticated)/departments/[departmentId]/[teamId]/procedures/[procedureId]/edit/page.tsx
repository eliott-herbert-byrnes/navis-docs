import { Heading } from "@/components/ui/Heading";
import { getSessionContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { teamProcedurePath } from "@/app/paths";
import { EditProcedureForm } from "@/features/procedures/components/procedure-edit-form";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";

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

  const ctx = await getSessionContext();
  const { org, isAdmin } = ctx ?? {};
  if (!org || !isAdmin) redirect(teamProcedurePath(departmentId, teamId));

  const trpc = await serverTrpc();
  const { data: procedure } = await trpc.procedures.getForEdit({ procedureId });

  if (!procedure) {
    redirect(teamProcedurePath(departmentId, teamId));
  }

  return (
    <>
      <Heading
        title={`Edit Procedure`}
        description="Edit a procedure and ship to documentation"
      />
      <Suspense fallback={<Skeleton />}>
        <EditProcedureForm procedureId={procedureId} procedure={procedure} />
      </Suspense>
    </>
  );
}
