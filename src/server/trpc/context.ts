import { auth } from "@/auth";
import { isDemoHost } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import {
  OrgMembershipRole,
  OrgPlan,
  Prisma,
  StripeSubscriptionStatus,
} from "@prisma/client";

type MembershipWithOrg = Prisma.OrgMembershipGetPayload<{
  include: { org: true };
}>;

async function createDemoContext() {
  const userId = process.env.DEMO_USER_ID!;
  const orgId = process.env.DEMO_ORG_ID!;

  let membership: MembershipWithOrg | null =
    await prisma.orgMembership.findFirst({
      where: { userId, orgId },
      include: { org: true },
    });

  if (!membership) {
    const org = await prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
    });
    membership = {
      id: "00000000-0000-4000-8000-000000000001",
      orgId: org.id,
      userId,
      createdAt: new Date(0),
      compliant: true,
      role: OrgMembershipRole.ADMIN,
      org,
    };
  }

  return {
    db: prisma,
    user: {
      id: userId,
      email: "demo@navis-docs.com",
      name: "Demo",
    },
    org: membership.org,
    membership,
    isAdmin: true,
    hasActiveAccess: true,
    isDemo: true,
  };
}

export async function createContext(opts?: FetchCreateContextFnOptions) {
  const host = opts?.req.headers.get("host");
  if (isDemoHost(host)) {
    return createDemoContext();
  }

  const session = await auth();
  const user = session?.user ?? null;

  let org = null;
  let membership = null;
  let isAdmin = false;

  if (user?.id) {
    membership = await prisma.orgMembership.findFirst({
      where: { userId: user.id },
      include: { org: true },
    });
    org = membership?.org ?? null;
    isAdmin =
      (membership?.role === "ADMIN" || membership?.role === "OWNER") ?? false;
  }

  const hasActiveAccess =
    org?.plan === OrgPlan.enterprise ||
    org?.stripeSubscriptionStatus === StripeSubscriptionStatus.active ||
    org?.stripeSubscriptionStatus === StripeSubscriptionStatus.trialing;

  return {
    db: prisma,
    user,
    org,
    membership,
    isAdmin,
    hasActiveAccess,
    isDemo: false,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
