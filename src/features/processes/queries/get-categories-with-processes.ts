import { prisma } from "@/lib/prisma";

export type CategoryWithProcesses = {
  id: string;
  name: string;
  sortOrder: number;
  processes: {
    id: string;
    slug: string;
    title: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  }[];
};

export async function getCategoriesWithProcesses(
  teamId: string
): Promise<CategoryWithProcesses[]> {
  const categories = await prisma.category.findMany({
    where: { teamId },
    select: {
      id: true,
      name: true,
      sortOrder: true,
      processes: {
        where: {
          status: "PUBLISHED", // Only show published processes in sidebar
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
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  return categories as CategoryWithProcesses[];
}

