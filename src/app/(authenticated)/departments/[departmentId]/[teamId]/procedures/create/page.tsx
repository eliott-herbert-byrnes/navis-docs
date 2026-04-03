import { Heading } from "@/components/ui/Heading";
import { getSessionContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { teamProcedurePath } from "@/app/paths";
import { CreateProcedureForm } from "@/features/procedures/components/procedure-create-form";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";
import { PageContainer } from "@/components/ui/page-container";

function CreateFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-44" />
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

export default async function ProcedureCreatePage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;
  const ctx = await getSessionContext();
  const { org, isAdmin } = ctx ?? {};
  if (!org || !isAdmin) redirect(teamProcedurePath(departmentId, teamId));

  const trpc = await serverTrpc();
  const { data: categories } = await trpc.procedures.categoriesWithCount({
    teamId,
  });

  return (
    <PageContainer>
      <Heading
        title={`Create Procedure`}
        description="Create a new procedure and add a category"
      />
      <Suspense fallback={<CreateFormSkeleton />}>
        <CreateProcedureForm categories={categories} />
      </Suspense>
    </PageContainer>
  );
}
