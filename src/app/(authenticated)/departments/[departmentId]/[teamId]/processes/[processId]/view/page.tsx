import { Heading } from "@/components/Heading";
import { Spinner } from "@/components/ui/spinner";
import { ProcessContent } from "@/features/processes/components/process-content";
import { ProcessViewActions } from "@/features/processes/components/process-view-actions";
import { ProcessViewMetadata } from "@/features/processes/components/process-view-metadata";
import { getProcessForView } from "@/features/processes/queries/get-process-for-view";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { signInPath } from "@/app/paths";
import "./print.css";
import { AIChatDrawer } from "@/features/ai/components/ai-chat-drawer";
import { prisma } from "@/lib/prisma";

export const revalidate = 1800;

export async function generateStaticParams() {
  const processes = await prisma.process.findMany({
    take: 50,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      teamId: true,
      team: {
        select: {
          departmentId: true,
        },
      },
    },
  });

  return processes.map((process) => ({
    departmentId: process.team.departmentId,
    teamId: process.teamId,
    processId: process.id,
  }));
}

type ProcessViewPageProps = {
  params: Promise<{ departmentId: string; teamId: string; processId: string }>;
};

const ProcessViewPage = async ({ params }: ProcessViewPageProps) => {
  const { departmentId, teamId, processId } = await params;

  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const [process, canEdit] = await Promise.all([
    getProcessForView(processId),
    isOrgAdminOrOwner(user.userId),
  ]);

  if (!process) {
    notFound();
  }

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
            isFavorite={process.isFavorite}
          />
        </div>
      </div>

      {/* Metadata */}
      <ProcessViewMetadata process={process} />

      {/* Content */}
      <Suspense fallback={<Spinner />}>
        <ProcessContent process={process} />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <AIChatDrawer teamId={teamId} departmentId={departmentId} />
      </Suspense>
    </div>
  );
};

export default ProcessViewPage;
