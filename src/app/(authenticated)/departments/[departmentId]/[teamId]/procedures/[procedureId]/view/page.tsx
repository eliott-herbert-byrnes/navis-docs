import { Heading } from "@/components/ui/Heading";
import { ProcedureViewWithAIChat } from "@/features/procedures/components/procedure-view-with-ai-chat";
import { getSessionContext } from "@/lib/auth";
import { isDemoContext } from "@/lib/demo";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";

function ProcedureViewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="rounded-md border p-4 space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-56 w-full" />
      </div>
    </div>
  );
}

type ProcedureViewPageProps = {
  params: Promise<{ procedureId: string }>;
};

const ProcedureViewPage = async ({ params }: ProcedureViewPageProps) => {
  const { procedureId } = await params;

  const ctx = await getSessionContext();
  const canViewProcedureAudit = ctx?.isAdmin ?? false;
  const isDemo = await isDemoContext();

  const trpc = await serverTrpc();
  const {
    data: procedure,
    isFavorite,
    isRead,
  } = await trpc.procedures.getForView({
    procedureId,
  });

  return (
    <div className="space-y-4">
      {/* Header with Title and Actions */}
      <Heading
        title={procedure.title}
        description={procedure.description || ""}
      />

      <Suspense fallback={<ProcedureViewSkeleton />}>
        <ProcedureViewWithAIChat
          procedure={procedure}
          procedureId={procedureId}
          canEdit={canViewProcedureAudit}
          isFavorite={isFavorite}
          isRead={isRead}
          canViewProcedureAudit={canViewProcedureAudit}
          isDemo={isDemo}
        />
      </Suspense>
    </div>
  );
};

export default ProcedureViewPage;
