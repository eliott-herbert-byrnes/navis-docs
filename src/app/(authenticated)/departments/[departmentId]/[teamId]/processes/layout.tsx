"use server";

import { ProcessSidebar } from "@/features/processes/components/process-sidebar";
import { Providers } from "@/app/providers";
import { serverTrpc } from "@/server/trpc/server";
import { ProcessRouteProvider } from "@/contexts/process-route-context";

export default async function ProcessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  const trpc = await serverTrpc();
  const { data: processes } = await trpc.process.list({ teamId });
  const { data: categories } = await trpc.process.categoriesWithProcesses({
    teamId,
  });

  return (
    <Providers>
      <ProcessRouteProvider departmentId={departmentId} teamId={teamId}>
        <div className="flex h-full w-full">
          <ProcessSidebar
            uncategorizedProcesses={processes}
            categories={categories}
          />
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </ProcessRouteProvider>
    </Providers>
  );
}
