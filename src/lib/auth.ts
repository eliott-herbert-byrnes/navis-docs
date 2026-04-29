import { prisma } from "./prisma";
import { auth } from "@/auth";
import { cache } from "react";
import {
  OrgMembershipRole,
  OrgPlan,
  StripeSubscriptionStatus,
} from "@prisma/client";
import { isDemoContext } from "./demo";

export const getSessionUser = async () => {
  const session = await auth();
  if (!session?.user?.email || !session.user.id) return null;
  return { email: session.user.email, userId: session.user.id };
};

async function getDemoSessionContext() {
  const org = await prisma.organization.findUniqueOrThrow({
    where: { id: process.env.DEMO_ORG_ID! },
  });
  return {
    userId: process.env.DEMO_USER_ID!,
    email: "demo@navis-docs.com",
    org,
    isAdmin: true,
    role: OrgMembershipRole.ADMIN,
    hasActiveAccess: true,
  };
}

export const getSessionContext = cache(async () => {
  if (await isDemoContext()) {
    return getDemoSessionContext();
  }

  const session = await auth()
  if (!session?.user?.id || !session.user.email) return null

  const membership = await prisma.orgMembership.findFirst({
    where: { userId: session.user.id },
    include: { org: true },
  });

  const org = membership?.org ?? null;
  const hasActiveAccess =
    org?.plan === OrgPlan.enterprise ||
    org?.stripeSubscriptionStatus === StripeSubscriptionStatus.active ||
    org?.stripeSubscriptionStatus === StripeSubscriptionStatus.trialing;

  return {
    userId: session.user.id,
    email: session.user.email,
    org,
    isAdmin: membership?.role === "ADMIN" || membership?.role === "OWNER",
    role: membership?.role ?? null,
    hasActiveAccess,
  };
});

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
  offset = 0,
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
    m.org.departments.flatMap((d) => d.teams.map((t) => t.id)),
  );
}
