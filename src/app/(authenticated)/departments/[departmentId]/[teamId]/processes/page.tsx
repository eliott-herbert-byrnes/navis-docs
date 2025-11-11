import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { onboardingPath, signInPath } from "@/app/paths";
import { ProcessBreadcrumbs } from "./_navigation";
import { ProcessCreateButton } from "@/features/processes/components/process-create-button";
import { FavoriteList } from "@/features/processes/components/favorite/components/favorite-list";
import { AIChatDrawer } from "@/features/ai/components/ai-chat-drawer";
import { getCachedDepartments } from "@/lib/cache-queries";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export async function generateStaticParams() {
  const teams = await prisma.team.findMany({
    select: {
      id: true,
      departmentId: true,
    },
  });
  return teams.map((team) => ({
    departmentId: team.departmentId,
    teamId: team.id,
  }));
}

export default async function ProcessPage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const { org, isAdmin } = await getUserOrgWithRole(user.userId);
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(signInPath());

  const { list: departments } = await getCachedDepartments(org.id);

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
      <Suspense fallback={<Spinner />}>
        <FavoriteList departmentId={departmentId} teamId={teamId} />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <AIChatDrawer teamId={teamId} departmentId={departmentId} />
      </Suspense>
    </>
  );
}
