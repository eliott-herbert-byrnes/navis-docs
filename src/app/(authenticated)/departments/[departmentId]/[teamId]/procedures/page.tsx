import { Heading } from "@/components/ui/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { Suspense } from "react";
import { ProcedureCreateButton } from "@/features/procedures/components/procedure-create-button";
import { AIChatDrawer } from "@/features/ai/components/chat-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";
import { FavoriteList } from "@/features/procedures/components/favorite/components/procedure-favorite-list";

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

  const teamName = departments
    .find((department) => department.id === departmentId)
    ?.teams.find((team) => team.id === teamId)?.name;

  return (
    <>
      <Heading
        title={`${teamName}`}
        actions={isAdmin ? <ProcedureCreateButton /> : null}
      />
      <FavoriteList />
      <Suspense fallback={<Skeleton />}>
        <AIChatDrawer />
      </Suspense>
    </>
  );
}
