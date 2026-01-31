import { Heading } from "@/components/ui/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { teamProcedurePath } from "@/app/paths";
import { CreateProcedureForm } from "@/features/procedures/components/procedure-create-form";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";

export default async function ProcedureCreatePage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;
  const user = await getSessionUser();

  const { org, isAdmin } = await getUserOrgWithRole(user!.userId);
  if (!org || !isAdmin) redirect(teamProcedurePath(departmentId, teamId));

  const trpc = await serverTrpc();
  const { data: categories } = await trpc.procedures.categoriesWithCount({
    teamId,
  });

  return (
    <>
      <Heading
        title={`Create Procedure`}
        description="Create a new procedure and add a category"
      />
      <Suspense fallback={<Skeleton />}>
        <CreateProcedureForm categories={categories} />
      </Suspense>
    </>
  );
}
