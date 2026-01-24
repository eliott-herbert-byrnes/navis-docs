import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { teamProcessPath } from "@/app/paths";
import { NewsCreateForm } from "@/features/news/components/news-create-form";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";

export default async function NewsCreatePage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  const user = await getSessionUser();

  const { isAdmin } = await getUserOrgWithRole(user?.userId ?? "");
  if (!isAdmin) redirect(teamProcessPath(departmentId, teamId));

  const trpc = await serverTrpc();
  const { list: departments } = await trpc.department.list();

  const teamName = departments
    .find((department) => department.id === departmentId)
    ?.teams.find((team) => team.id === teamId)?.name;

  return (
    <>
      <Heading title={`Create News`} description="Create a new news post" />
      <Suspense fallback={<Skeleton />}>
        <NewsCreateForm teamName={teamName ?? "this team"} />
      </Suspense>
    </>
  );
}
