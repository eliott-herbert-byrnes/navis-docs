import { ProcessSidebar } from "@/features/processes/components/process-sidebar";

export default async function ProcessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { departmentId: string; teamId: string };
}) {
  return (
    <div className="flex h-full w-full">
      <ProcessSidebar departmentId={params.departmentId} teamId={params.teamId} />
      <main className="flex-1 overflow-auto p-4">{children}</main>
    </div>
  );
}
