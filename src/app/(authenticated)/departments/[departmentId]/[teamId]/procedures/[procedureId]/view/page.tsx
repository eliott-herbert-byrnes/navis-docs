import { Heading } from "@/components/ui/Heading";
import { ProcedureContent } from "@/features/procedures/components/procedure-content";
import { ProcedureViewActions } from "@/features/procedures/components/procedure-view-actions";
import { ProcedureViewMetadata } from "@/features/procedures/components/procedure-view-metadata";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { Suspense } from "react";
import { AIChatDrawer } from "@/features/ai/components/chat-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";

type ProcedureViewPageProps = {
  params: Promise<{ procedureId: string }>;
};

const ProcedureViewPage = async ({ params }: ProcedureViewPageProps) => {
  const { procedureId } = await params;

  const user = await getSessionUser();
  const [canEdit] = await Promise.all([isOrgAdminOrOwner(user!.userId)]);

  const trpc = await serverTrpc();
  const { data: procedure, isFavorite } = await trpc.procedures.getForView({
    procedureId,
  });

  return (
    <div className="space-y-4">
      {/* Header with Title and Actions */}
      <Heading
        title={procedure.title}
        description={procedure.description || ""}
      />
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="procedure-view-actions" data-print-hide>
          <ProcedureViewActions
            procedure={procedure}
            procedureId={procedureId}
            canEdit={canEdit}
            isFavorite={isFavorite}
          />
        </div>
      </div>

      {/* Metadata */}
      <ProcedureViewMetadata procedure={procedure} />

      {/* Content */}
      <Suspense fallback={<Skeleton />}>
        <ProcedureContent procedure={procedure} />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <AIChatDrawer />
      </Suspense>
    </div>
  );
};

export default ProcedureViewPage;
