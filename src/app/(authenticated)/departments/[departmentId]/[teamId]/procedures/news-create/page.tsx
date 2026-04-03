import { Heading } from "@/components/ui/Heading";
import { getSessionContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { teamProcedurePath } from "@/app/paths";
import { NewsCreateForm } from "@/features/news/components/news-create-form";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";

function CreateFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end">
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}

export default async function NewsCreatePage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  const ctx = await getSessionContext();
  const { isAdmin } = ctx ?? {};
  if (!isAdmin) redirect(teamProcedurePath(departmentId, teamId));

  const trpc = await serverTrpc();
  const { list: departments } = await trpc.department.list();

  const teamName = departments
    .find((department) => department.id === departmentId)
    ?.teams.find((team) => team.id === teamId)?.name;

  return (
    <>
      <Heading title={`Create News`} description="Create a new news post" />
      <Suspense fallback={<CreateFormSkeleton />}>
        <NewsCreateForm teamName={teamName ?? "this team"} />
      </Suspense>
    </>
  );
}
