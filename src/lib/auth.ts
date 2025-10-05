import { prisma } from "./prisma";
import { auth } from "@/auth"

export const getSessionUser = async () => {
  const session = await auth();
  if (!session?.user?.email || !(session as any).userId) return null;
  return { email: session.user.email, userId: (session as any).userId as string };
}

export const getUserOrg = async (userId: string) => {
  const membership = await prisma.orgMembership.findFirst({
    where: { userId },
    include: { org: true },
  });
  return membership?.org ?? null;
}

export const isOrgAdminOrOwner = async (userId: string) => {
  const membership = await prisma.orgMembership.findFirst({
    where: { userId, role: { in: ["ADMIN", "OWNER"] } },
  });
  return membership !== null;
}
