import { prisma } from "@/lib/prisma";

export async function getAddresses(orgId: string) {
  try {
    const addresses = await prisma.address.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return addresses;
  } catch (error) {
    console.error("Failed to fetch addresses:", error);
    return [];
  }
}