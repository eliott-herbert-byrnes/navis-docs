import { OrgPlan, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { canonicalEmail } from "@/lib/email-canonical";
import { applyOrgDemoContent } from "../../prisma/org-demo-content";
import { seedDemoAuditLogs } from "../../prisma/seed-demo-audit-logs";
import { wipeDemoOrg } from "../../prisma/wipe-demo-org";
import { DEMO_USER_EMAIL, DEMO_MEMBER_EMAIL } from "@/lib/demo-constants";
 
const DEMO_MEMBER_USER_ID = requireEnv("DEMO_MEMBER_USER_ID");

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v?.length) throw new Error(`Missing required env: ${name}`);
  return v;
}

/**
 * Wipes `DEMO_ORG_ID` data and re-applies the same org tree as `prisma/seed.ts`.
 * Uses `DEMO_USER_ID` as owner and a stable member id (`DEMO_MEMBER_USER_ID` or default).
 */
export async function resetDemoData(): Promise<void> {
  const orgId = requireEnv("DEMO_ORG_ID");
  const ownerUserId = requireEnv("DEMO_USER_ID");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    await wipeDemoOrg(prisma, orgId);

    const ownerEmail = DEMO_USER_EMAIL;   
    const memberEmail = DEMO_MEMBER_EMAIL; 
    
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
      where: { id: DEMO_MEMBER_USER_ID },
      create: {
        id: DEMO_MEMBER_USER_ID,
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
      memberUserId: DEMO_MEMBER_USER_ID,
    });

    await seedDemoAuditLogs(prisma, {
      orgId,
      ownerUserId,
      memberUserId: DEMO_MEMBER_USER_ID,
    });
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
