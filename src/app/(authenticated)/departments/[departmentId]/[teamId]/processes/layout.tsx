import { ProcessSidebar } from "@/features/processes/components/process-sidebar";

export default async function ProcessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  return (
    <div className="flex h-full w-full">
      <ProcessSidebar
        departmentId={departmentId}
        teamId={teamId}
      />
      <main className="flex-1 overflow-auto p-4">{children}</main>
    </div>
  );
}
