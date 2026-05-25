import { auth } from "@/auth";
import { resolveOrgWriteAccess } from "@/lib/billing/access";
import { isDemoHost } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { headers } from "next/headers";
import { OrgMembershipRole, Prisma } from "@prisma/client";
import { DEMO_USER_EMAIL } from "@/lib/demo-constants";

type MembershipWithOrg = Prisma.OrgMembershipGetPayload<{
  include: { org: true };
}>;

async function createDemoContext() {
  const userId = process.env.DEMO_USER_ID!;
  const orgId = process.env.DEMO_ORG_ID!;

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return null;

  let membership: MembershipWithOrg | null =
    await prisma.orgMembership.findFirst({
      where: { userId, orgId },
      include: { org: true },
    });

  if (!membership) {
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
      email: DEMO_USER_EMAIL,
      name: "Demo",
    },
    org: membership.org,
    membership,
    isAdmin: true,
    hasActiveAccess: true,
    accessLevel: "full" as const,
    graceEndsAt: null,
    isDemo: true,
  };
}

export async function createContext(opts?: FetchCreateContextFnOptions) {
  // When invoked from the fetch adapter (`/api/trpc/...`), the host comes from
  // the incoming request. When invoked directly via `serverTrpc()` from a
  // Server Component, `opts` is undefined, so fall back to `next/headers`.
  // Without this fallback, the demo host check fails on the server-side
  // caller path and demo pages that fetch via `serverTrpc()` are treated as
  // unauthenticated.
  const host = opts?.req.headers.get("host") ?? (await headers()).get("host");
  if (isDemoHost(host)) {
    const demoCtx = await createDemoContext();
    if (demoCtx) return demoCtx;
    return {
      db: prisma,
      user: null,
      org: null,
      membership: null,
      isAdmin: false,
      hasActiveAccess: false,
      accessLevel: "read_only" as const,
      graceEndsAt: null,
      isDemo: true,
    };
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

  const orgAccess = org
    ? resolveOrgWriteAccess(org)
    : {
        hasWriteAccess: false,
        accessLevel: "read_only" as const,
        graceEndsAt: null,
      };

  return {
    db: prisma,
    user,
    org,
    membership,
    isAdmin,
    /** Write access — see `resolveOrgWriteAccess()`. */
    hasActiveAccess: orgAccess.hasWriteAccess,
    accessLevel: orgAccess.accessLevel,
    graceEndsAt: orgAccess.graceEndsAt,
    isDemo: false,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
