import { Heading } from "@/components/ui/Heading";
import { ProcedureViewWithAIChat } from "@/features/procedures/components/procedure-view-with-ai-chat";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { Suspense } from "react";
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

      <Suspense fallback={<Skeleton />}>
        <ProcedureViewWithAIChat
          procedure={procedure}
          procedureId={procedureId}
          canEdit={canEdit}
          isFavorite={isFavorite}
        />
      </Suspense>
    </div>
  );
};

export default ProcedureViewPage;
