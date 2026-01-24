import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { teamProcessPath } from "@/app/paths";
import { CreateProcessForm } from "@/features/processes/components/process-create-form";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";

export default async function ProcessCreatePage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;
  const user = await getSessionUser();

  const { org, isAdmin } = await getUserOrgWithRole(user!.userId);
  if (!org || !isAdmin) redirect(teamProcessPath(departmentId, teamId));

  const trpc = await serverTrpc();
  const { data: categories } = await trpc.process.categoriesWithCount({
    teamId,
  });

  return (
    <>
      <Heading
        title={`Create Process`}
        description="Create a new process and add a category"
      />
      <Suspense fallback={<Skeleton />}>
        <CreateProcessForm categories={categories} />
      </Suspense>
    </>
  );
}
