import {
  InvitationStatus,
  OrgMembershipRole,
  OrgPlan,
  type PrismaClient,
} from "@prisma/client";
import { canonicalEmail } from "@/lib/email-canonical";

function slugKeyFromLabel(raw: string): string {
  const s = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return s || "organisation";
}

async function allocateUniqueOrgSlug(
  prisma: Pick<PrismaClient, "organization">,
  slugBaseLabel: string,
): Promise<string> {
  let root = slugKeyFromLabel(slugBaseLabel);
  if (!root) root = "organisation";

  for (let n = 0; n < 1000; n++) {
    const slug = n === 0 ? root : `${root}-${n}`;
    const clash = await prisma.organization.findUnique({ where: { slug } });
    if (!clash) return slug;
  }

  throw new Error("Unable to allocate a unique organization slug");
}

type EnsureDefaultOrgParams = {
  userId: string;
  /** Raw email stored on User */
  email: string;
  name: string | null;
};

/**
 * When a user completes sign-in with no membership yet, create a default org.
 * Skip when a pending (non-expired) invitation exists so onboarding can route
 * to `/auth/pending-invite` / accept-invite first.
 */
export async function ensureDefaultOrgForUser(
  prisma: PrismaClient,
  { userId, email, name }: EnsureDefaultOrgParams,
): Promise<void> {
  const canonical = canonicalEmail(email);

  const pendingInvite = await prisma.invitation.findFirst({
    where: {
      canonicalEmail: canonical,
      status: InvitationStatus.PENDING,
      expiresAt: { gt: new Date() },
    },
    select: { orgId: true },
  });
  if (pendingInvite) return;

  const membership = await prisma.orgMembership.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (membership) return;

  const orgName = name?.trim() || "My Organisation";
  const slugBase = name?.trim() || email.trim();
  const slug = await allocateUniqueOrgSlug(prisma, slugBase);

  await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: orgName,
        slug,
        ownerUserId: userId,
        plan: OrgPlan.pro,
        entitlementsJSON: {},
      },
    });
    await tx.orgMembership.create({
      data: {
        userId,
        orgId: org.id,
        role: OrgMembershipRole.OWNER,
      },
    });
  });
}
