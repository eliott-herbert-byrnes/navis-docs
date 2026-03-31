import { ProcedureSidebar } from "@/features/procedures/components/procedure-sidebar";
import { serverTrpc } from "@/server/trpc/server";
import { ProcedureRouteProvider } from "@/contexts/procedure-route-context";
import { getSessionContext } from "@/lib/auth";

export default async function ProcedureLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;
  const ctx = await getSessionContext();
  if (!ctx) return <div className="h-full invisible" aria-hidden></div>;
  const { isAdmin } = ctx;

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
      <ProcedureRouteProvider departmentId={departmentId} teamId={teamId}>
        <div className="col-span-24 grid grid-cols-24">
            <ProcedureSidebar
              isAdmin={isAdmin}
              uncategorizedProcedures={procedures}
              categories={categories}
              unreadProcedureVersionIds={unreadProcedureVersionIds}
              unreadNewsCount={unreadNewsCount ?? 0}
            />

            <main className="col-span-14 col-start-8 lg:col-span-16 lg:col-start-6">{children}</main>
        </div>
      </ProcedureRouteProvider>
  );
}
