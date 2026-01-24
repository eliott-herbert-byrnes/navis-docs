import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { teamProcessPath } from "@/app/paths";
import { EditProcessForm } from "@/features/processes/components/process-edit-form";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";

export default async function ProcessEditPage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string; processId: string }>;
}) {
  const { departmentId, teamId, processId } = await params;

  const user = await getSessionUser();
  const { org, isAdmin } = await getUserOrgWithRole(user!.userId);
  if (!org || !isAdmin) redirect(teamProcessPath(departmentId, teamId));

  const trpc = await serverTrpc();
  const { data: process } = await trpc.process.getForEdit({ processId });

  if (!process) {
    redirect(teamProcessPath(departmentId, teamId));
  }

  return (
    <>
      <Heading
        title={`Edit Process`}
        description="Edit a process and ship to documentation"
      />
      <Suspense fallback={<Skeleton />}>
        <EditProcessForm processId={processId} process={process} />
      </Suspense>
    </>
  );
}
