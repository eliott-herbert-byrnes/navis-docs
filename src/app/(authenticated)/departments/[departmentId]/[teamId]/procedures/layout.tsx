"use server";

import { ProcedureSidebar } from "@/features/procedures/components/procedure-sidebar";
import { Providers } from "@/app/providers";
import { serverTrpc } from "@/server/trpc/server";
import { ProcedureRouteProvider } from "@/contexts/procedure-route-context";

export default async function ProcedureLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  const trpc = await serverTrpc();
  const { data: procedures } = await trpc.procedures.list({ teamId });
  const { data: categories } = await trpc.procedures.categoriesWithProcedures({
    teamId,
  });

  return (
    <Providers>
      <ProcedureRouteProvider departmentId={departmentId} teamId={teamId}>
        <div className="flex h-full w-full">
          <ProcedureSidebar
            uncategorizedProcedures={procedures}
            categories={categories}
          />
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </ProcedureRouteProvider>
    </Providers>
  );
}
