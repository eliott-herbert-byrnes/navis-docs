import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { Suspense } from "react";
import { ProcessBreadcrumbs } from "./_navigation";
import { ProcessCreateButton } from "@/features/processes/components/process-create-button";
import { FavoriteList } from "@/features/processes/components/favorite/components/favorite-list";
import { AIChatDrawer } from "@/features/ai/components/ai-chat-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";

export const revalidate = 3600;

export default async function ProcessPage({
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
    (department) => department.id === departmentId
  )?.name;

  const teamName = departments
    .find((department) => department.id === departmentId)
    ?.teams.find((team) => team.id === teamId)?.name;

  return (
    <>
      <Heading
        title={`${teamName} Docs`}
        actions={
          isAdmin ? (
            <ProcessCreateButton
              departmentId={departmentId}
              teamId={teamId}
              isAdmin={isAdmin}
            />
          ) : null
        }
        breadcrumbs={
          <ProcessBreadcrumbs
            teamName={teamName}
            departmentName={departmentName}
          />
        }
      />
      <Suspense fallback={<Skeleton />}>
        <FavoriteList departmentId={departmentId} teamId={teamId} />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <AIChatDrawer teamId={teamId} departmentId={departmentId} />
      </Suspense>
    </>
  );
}
