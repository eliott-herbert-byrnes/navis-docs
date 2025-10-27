import { prisma } from "@/lib/prisma";

type CategoryListItem = {
    id: string;
    name: string;
    sortOrder: number;
}

export const getCategories = async (teamId: string): Promise<{
    list: CategoryListItem[];
    metadata: { count: number };
}> => {
    const [categories, count] = await prisma.$transaction([
        prisma.category.findMany({
            where: { teamId },
            select: { id: true, name: true, sortOrder: true },
            orderBy: { sortOrder: "asc" },
        }),
        prisma.category.count({
            where: { teamId },
        }),
    ]);
    return { list: categories, metadata: { count } };
}