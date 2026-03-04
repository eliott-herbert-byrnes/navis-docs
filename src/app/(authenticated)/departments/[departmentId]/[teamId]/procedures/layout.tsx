"use server";

import { ProcedureSidebar } from "@/features/procedures/components/procedure-sidebar";
import { Providers } from "@/app/providers";
import { serverTrpc } from "@/server/trpc/server";
import { ProcedureRouteProvider } from "@/contexts/procedure-route-context";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";

export default async function ProcedureLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;
  const user = await getSessionUser();

  if (!user) return <div className="h-full invisible" aria-hidden></div>;
  const isAdmin = await isOrgAdminOrOwner(user.userId);

  const trpc = await serverTrpc();
  const [
    { data: procedures },
    { data: categories },
    { data: outstanding },
    { count: unreadNewsCount },
  ] = await Promise.all([
    trpc.procedures.list({ teamId }),
    trpc.procedures.categoriesWithProcedures({ teamId }),
    trpc.procedures.getOutstandingForCurrentUser({}),
    trpc.news.getUnreadNewsCountForCurrentUser({ teamId }),
  ]);

  const unreadProcedureVersionIds =
    outstanding?.map(
      ({ procedureId, versionId }) => `${procedureId}:${versionId}`,
    ) ?? [];

  return (
    <Providers>
      <ProcedureRouteProvider departmentId={departmentId} teamId={teamId}>
        <div className="flex h-full w-full">
          <ProcedureSidebar
            isAdmin={isAdmin}
            uncategorizedProcedures={procedures}
            categories={categories}
            unreadProcedureVersionIds={unreadProcedureVersionIds}
            unreadNewsCount={unreadNewsCount ?? 0}
          />
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </ProcedureRouteProvider>
    </Providers>
  );
}
