import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { signInPath, teamProcessPath } from "@/app/paths";
import { getProcessForEdit } from "@/features/processes/queries/get-process-for-edit";
import { EditProcessForm } from "@/features/processes/components/process-edit-form";

export default async function ProcessEditPage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string; processId: string }>;
}) {
  const { departmentId, teamId, processId } = await params;

  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const { org, isAdmin } = await getUserOrgWithRole(user.userId);
  if (!org || !isAdmin) redirect(teamProcessPath(departmentId, teamId));

  const process = await getProcessForEdit(processId);

  if (!process) {
    redirect(teamProcessPath(departmentId, teamId));
  }

  return (
    <>
      <Heading
        title={`Edit Process`}
        description="Edit a process and ship to documentation"
      />
      <Suspense fallback={<Spinner />}>
        <EditProcessForm
          departmentId={departmentId}
          teamId={teamId}
          processId={processId}
          process={process}
        />
      </Suspense>
    </>
  );
}
