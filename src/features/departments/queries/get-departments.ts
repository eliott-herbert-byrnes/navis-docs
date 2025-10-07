"use server";

import { prisma } from "@/lib/prisma";

type DepartmentListItem = {
  id: string;
  name: string;
  teams: { id: string; name: string }[];
};

export const getDepartments = async (
  orgId: string
): Promise<{
  list: DepartmentListItem[];
  metadata: { count: number };
}> => {
  const [departments, count] = await prisma.$transaction([
    prisma.department.findMany({
      where: { orgId },
      select: {
        id: true,
        name: true,
        teams: { select: { id: true, name: true } },
      },
    }),
    prisma.department.count({
      where: { orgId },
    }),
  ]);

  return { list: departments, metadata: { count } };
};
