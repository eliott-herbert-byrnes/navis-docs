import { Heading } from "@/components/Heading";
import { ProcessContent } from "@/features/processes/components/process-content";
import { ProcessViewActions } from "@/features/processes/components/process-view-actions";
import { ProcessViewMetadata } from "@/features/processes/components/process-view-metadata";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { Suspense } from "react";
import { AIChatDrawer } from "@/features/ai/components/ai-chat-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";

type ProcessViewPageProps = {
  params: Promise<{ departmentId: string; teamId: string; processId: string }>;
};

const ProcessViewPage = async ({ params }: ProcessViewPageProps) => {
  const { departmentId, teamId, processId } = await params;

  const user = await getSessionUser();
  const [canEdit] = await Promise.all([isOrgAdminOrOwner(user!.userId)]);

  const trpc = await serverTrpc();
  const { data: process, isFavorite } = await trpc.process.getForView({
    processId,
  });

  return (
    <div className="space-y-4">
      {/* Header with Title and Actions */}
      <Heading title={process.title} description={process.description || ""} />
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="process-view-actions" data-print-hide>
          <ProcessViewActions
            departmentId={departmentId}
            teamId={teamId}
            processId={processId}
            canEdit={canEdit}
            isFavorite={isFavorite}
          />
        </div>
      </div>

      {/* Metadata */}
      <ProcessViewMetadata process={process} />

      {/* Content */}
      <Suspense fallback={<Skeleton />}>
        <ProcessContent process={process} />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <AIChatDrawer teamId={teamId} departmentId={departmentId} />
      </Suspense>
    </div>
  );
};

export default ProcessViewPage;
