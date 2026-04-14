import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrgPlan, StripeSubscriptionStatus } from "@prisma/client";

export async function createContext() {
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
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
