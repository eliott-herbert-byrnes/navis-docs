import { prisma } from "./prisma";
import { auth } from "@/auth";

export const getSessionUser = async () => {
  const session = await auth();
  if (!session?.user?.email || !session.user.id) return null;
  return { email: session.user.email, userId: session.user.id };
};

export const getUserOrgWithRole = async (userId: string) => {
  const membership = await prisma.orgMembership.findFirst({
    where: { userId },
    include: { org: true },
  });
  
  if (!membership) {
    return { org: null, isAdmin: false, role: null };
  }
  
  const isAdmin = membership.role === "ADMIN" || membership.role === "OWNER";
  
  return {
    org: membership.org,
    isAdmin,
    role: membership.role,
  };
};

export const getUserOrg = async (userId: string) => {
  const membership = await prisma.orgMembership.findFirst({
    where: { userId },
    include: { org: true, user: { select: { memberships: { select: { role: true } } } } },
  });
  return {
    org: membership?.org ?? null,
    role: membership?.user?.memberships[0]?.role ?? null,
  };
};

export const isOrgAdminOrOwner = async (userId: string) => {
  const membership = await prisma.orgMembership.findFirst({
    where: { userId, role: { in: ["ADMIN", "OWNER"] } },
  });
  return membership !== null;
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user ?? null;
};

export const getOrgMembers = async (
  orgId: string, 
  search?: string,
  limit = 10,
  offset = 0
) => {
  const where = {
    orgId,
    ...(search
      ? {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
  };

  const [members, total] = await Promise.all([
    prisma.orgMembership.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            emailVerified: true,
            memberships: {
              select: {
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
      take: limit,
      skip: offset,  
    }),
    prisma.orgMembership.count({ where }),
  ]);

  return {
    members: members ?? [],
    total,
    hasMore: offset + limit < total,
    currentPage: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit),
  };
};

export async function getUserTeamIds(userId: string): Promise<string[]> {
  const memberships = await prisma.orgMembership.findMany({
    where: { userId },
    include: {
      org: {
        include: {
          departments: {
            include: {
              teams: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  return memberships.flatMap((m) =>
    m.org.departments.flatMap((d) => d.teams.map((t) => t.id))
  );
}
