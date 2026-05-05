import { OrgPlan, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { canonicalEmail } from "@/lib/email-canonical";
import { applyOrgDemoContent } from "../../prisma/org-demo-content";
import { seedDemoAuditLogs } from "../../prisma/seed-demo-audit-logs";
import { wipeDemoOrg } from "../../prisma/wipe-demo-org";
import {
  DEMO_USER_EMAIL,
  DEMO_MEMBER_EMAIL,
  DEMO_FALLBACK_MEMBER_USER_ID,
} from "@/lib/demo-constants";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v?.length) throw new Error(`Missing required env: ${name}`);
  return v;
}

function resolveDemoMemberUserId(ownerUserId: string): string {
  const fromEnv = process.env.DEMO_MEMBER_USER_ID?.trim();
  if (fromEnv && fromEnv !== ownerUserId) return fromEnv;
  if (ownerUserId === DEMO_FALLBACK_MEMBER_USER_ID) {
    throw new Error(
      "DEMO_USER_ID must not equal the built-in fallback demo member id. Change DEMO_USER_ID or set DEMO_MEMBER_USER_ID to a different uuid.",
    );
  }
  return DEMO_FALLBACK_MEMBER_USER_ID;
}

/**
 * Moves any non-demo users off `email` / `canonicalEmail` so upsert-by-id can recreate
 * demo identities (e.g. seed used an auto id for the member but reset uses a fixed id).
 */
async function reclaimDemoEmailExceptUsers(
  prisma: PrismaClient,
  email: string,
  exceptUserIds: string[],
): Promise<void> {
  const canonical = canonicalEmail(email);
  const conflicts = await prisma.user.findMany({
    where: {
      id: { notIn: exceptUserIds },
      OR: [{ email }, { canonicalEmail: canonical }],
    },
    select: { id: true },
  });
  for (const { id } of conflicts) {
    const placeholderEmail = `reclaimed+${id}+demo-reset@invalid.local`;
    await prisma.user.update({
      where: { id },
      data: {
        email: placeholderEmail,
        canonicalEmail: canonicalEmail(placeholderEmail),
      },
    });
  }
}

/**
 * Wipes `DEMO_ORG_ID` data and re-applies the same org tree as `prisma/seed-demo.ts`.
 * Uses `DEMO_USER_ID` as owner and `DEMO_MEMBER_USER_ID` when set and distinct from the owner,
 * otherwise {@link DEMO_FALLBACK_MEMBER_USER_ID}.
 */
export async function resetDemoData(): Promise<void> {
  const orgId = requireEnv("DEMO_ORG_ID");
  const ownerUserId = requireEnv("DEMO_USER_ID");
  const memberUserId = resolveDemoMemberUserId(ownerUserId);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    await wipeDemoOrg(prisma, orgId);

    const ownerEmail = DEMO_USER_EMAIL;
    const memberEmail = DEMO_MEMBER_EMAIL;

    await reclaimDemoEmailExceptUsers(prisma, ownerEmail, [ownerUserId]);
    await reclaimDemoEmailExceptUsers(prisma, memberEmail, [
      ownerUserId,
      memberUserId,
    ]);

    await prisma.user.upsert({
      where: { id: ownerUserId },
      create: {
        id: ownerUserId,
        email: ownerEmail,
        canonicalEmail: canonicalEmail(ownerEmail),
        name: "Demo User",
      },
      update: {
        email: ownerEmail,
        canonicalEmail: canonicalEmail(ownerEmail),
        name: "Demo User",
      },
    });

    await prisma.user.upsert({
      where: { id: memberUserId },
      create: {
        id: memberUserId,
        email: memberEmail,
        canonicalEmail: canonicalEmail(memberEmail),
        name: "Test User",
      },
      update: {
        email: memberEmail,
        canonicalEmail: canonicalEmail(memberEmail),
        name: "Test User",
      },
    });

    await prisma.organization.create({
      data: {
        id: orgId,
        name: "Demo Organization",
        slug: "demo-organization",
        ownerUserId,
        plan: OrgPlan.pro,
        entitlementsJSON: {},
      },
    });

    await applyOrgDemoContent(prisma, {
      orgId,
      ownerUserId,
      memberUserId,
    });

    await seedDemoAuditLogs(prisma, {
      orgId,
      ownerUserId,
      memberUserId,
    });
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
