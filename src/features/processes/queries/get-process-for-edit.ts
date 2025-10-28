import { prisma } from "@/lib/prisma";

export type ProcessForEdit = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    style: "RAW" | "STEPS" | "FLOW" | "YESNO";
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    categoryId: string | null;
    category: {
        id: string;
        name: string;
    } | null;
    pendingVersion: {
        id: string;
        contentJSON: any;
        style: "RAW" | "STEPS" | "FLOW" | "YESNO";
        createdAt: Date;
    } | null;
    publishedVersion: {
        id: string;
        contentJSON: any;
        style: "RAW" | "STEPS" | "FLOW" | "YESNO";
        createdAt: Date;
    } | null;
    team: {
        id: string;
        name: string;
        department: {
            id: string;
            name: string;
        }
    }
}

export const getProcessForEdit = async (processId: string): Promise<ProcessForEdit | null> => {
    const process = await prisma.process.findUnique({
        where: { id: processId },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                }
            },
            pendingVersion: {
                select: {
                    id: true,
                    contentJSON: true,
                    style: true,
                    createdAt: true,
                }
            },
            publishedVersion: {
                select: {
                    id: true,
                    contentJSON: true,
                    style: true,
                    createdAt: true,
                }
            },
            team: {
                select: {
                    id: true,
                    name: true,
                    department: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            }
        }
    });

return process as ProcessForEdit | null;;
}