"use server";

import { ProcessSidebar } from "@/features/processes/components/process-sidebar";
import { Providers } from "@/app/providers";
import { serverTrpc } from "@/server/trpc/server";

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
      <div className="flex h-full w-full">
        <ProcessSidebar
          departmentId={departmentId}
          teamId={teamId}
          uncategorizedProcesses={processes}
          categories={categories}
        />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </Providers>
  );
}
