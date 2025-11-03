import { ProcessSidebar } from "@/features/processes/components/process-sidebar";
import { Providers } from "@/app/providers";


export default async function ProcessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  return (
    <Providers>
    <div className="flex h-full w-full">
      <ProcessSidebar
        departmentId={departmentId}
        teamId={teamId}
      />
      <main className="flex-1 overflow-auto p-4">{children}</main>
    </div>
    </Providers>
  );
}
