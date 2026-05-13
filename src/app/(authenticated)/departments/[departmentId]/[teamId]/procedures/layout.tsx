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
  const initialSidebarData = await trpc.sidebar.getSidebarData({ teamId });

  return (
    <ProcedureRouteProvider departmentId={departmentId} teamId={teamId}>
      <div className="sm:grid sm:col-span-24 sm:grid-cols-24">
        <ProcedureSidebar isAdmin={isAdmin} initialData={initialSidebarData} />

        <main className="sm:col-span-14 sm:col-start-8 lg:col-span-16 lg:col-start-6">
          {children}
        </main>
      </div>
    </ProcedureRouteProvider>
  );
}
