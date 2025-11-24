"use server";

import { ProcessSidebar } from "@/features/processes/components/process-sidebar";
import { Providers } from "@/app/providers";
import { prisma } from "@/lib/prisma";
import { getCategoriesWithProcesses } from "@/features/processes/queries/get-categories-with-processes";

export default async function ProcessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  const uncategorizedProcesses = await prisma.process.findMany({
    where: {
      teamId,
      categoryId: null,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  const categories = await getCategoriesWithProcesses(teamId);

  return (
    <Providers>
      <div className="flex h-full w-full">
        <ProcessSidebar
          departmentId={departmentId}
          teamId={teamId}
          uncategorizedProcesses={uncategorizedProcesses}
          categories={categories}
        />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </Providers>
  );
}
