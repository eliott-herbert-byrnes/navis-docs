import { Heading } from "@/components/ui/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { Suspense } from "react";
import { ProcedureBreadcrumbs } from "./_navigation";
import { ProcedureCreateButton } from "@/features/procedures/components/procedure-create-button";
import { AIChatDrawer } from "@/features/ai/components/chat-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";
import { FavoriteList } from "@/features/procedures/components/favorite/components/procedure-favorite-list";

export const revalidate = 3600;

export default async function ProcedurePage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  const user = await getSessionUser();
  const { isAdmin } = await getUserOrgWithRole(user?.userId ?? "");

  const trpc = await serverTrpc();
  const { list: departments } = await trpc.department.list();

  const departmentName = departments.find(
    (department) => department.id === departmentId,
  )?.name;

  const teamName = departments
    .find((department) => department.id === departmentId)
    ?.teams.find((team) => team.id === teamId)?.name;

  return (
    <>
      <Heading
        title={`${teamName} Docs`}
        actions={isAdmin ? <ProcedureCreateButton /> : null}
        breadcrumbs={
          <ProcedureBreadcrumbs
            teamName={teamName}
            departmentName={departmentName}
          />
        }
      />
      <FavoriteList />
      <Suspense fallback={<Skeleton />}>
        <AIChatDrawer />
      </Suspense>
    </>
  );
}
