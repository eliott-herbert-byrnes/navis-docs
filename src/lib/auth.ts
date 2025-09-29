import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "./prisma";

export const getSessionUser = async () => {
  const session = await getServerSession(authOptions);
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