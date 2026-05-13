import "dotenv/config";
import { OrgPlan, PrismaClient } from "@prisma/client";
import { canonicalEmail } from "../src/lib/email-canonical";
import { DEMO_FALLBACK_MEMBER_USER_ID } from "../src/lib/demo-constants";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { applyOrgDemoContent } from "./org-demo-content";
import { seedDemoAuditLogs } from "./seed-demo-audit-logs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const DEMO_USER_ID = process.env.DEMO_USER_ID!;
const DEMO_ORG_ID = process.env.DEMO_ORG_ID!;
const memberUserIdFromEnv = process.env.DEMO_MEMBER_USER_ID?.trim();
const DEMO_MEMBER_USER_ID =
  memberUserIdFromEnv && memberUserIdFromEnv !== DEMO_USER_ID
    ? memberUserIdFromEnv
    : DEMO_FALLBACK_MEMBER_USER_ID;

async function main() {
  if (DEMO_MEMBER_USER_ID === DEMO_USER_ID) {
    throw new Error(
      "DEMO_USER_ID must not equal the demo member user id (including the built-in fallback).",
    );
  }

  await prisma.$transaction([
    // Null out self-referencing FKs before deleting versions
    prisma.procedure.updateMany({
      data: { pendingVersionId: null, publishedVersionId: null },
    }),

    // Delete all child/leaf tables first
    prisma.ingestionJob.deleteMany(),
    prisma.auditExportJob.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.errorReport.deleteMany(),
    prisma.userNewsRead.deleteMany(),
    prisma.newsPost.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.idea.deleteMany(),
    prisma.procedureChunk.deleteMany(),
    prisma.userProcedureRead.deleteMany(),
    prisma.procedureRollout.deleteMany(),
    prisma.procedureVersion.deleteMany(),
    prisma.procedure.deleteMany(),
    prisma.category.deleteMany(),
    prisma.team.deleteMany(),
    prisma.department.deleteMany(),
    prisma.address.deleteMany(),
    prisma.orgMembership.deleteMany(),
    prisma.invitation.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.emailOTP.deleteMany(),
    prisma.organization.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const user = await prisma.user.create({
    data: {
      id: DEMO_USER_ID,
      email: "demo@navisdocs.com",
      canonicalEmail: canonicalEmail("demo@navisdocs.com"),
      name: "Demo User",
    },
  });

  const testUser = await prisma.user.create({
    data: {
      id: DEMO_MEMBER_USER_ID,
      email: "test@navisdocs.com",
      canonicalEmail: canonicalEmail("test@navisdocs.com"),
      name: "Test User",
    },
  });

  const org = await prisma.organization.create({
    data: {
      id: DEMO_ORG_ID,
      name: "Demo Organization",
      slug: "demo-organization",
      ownerUserId: user.id,
      plan: OrgPlan.pro,
      entitlementsJSON: {},
    },
  });

  await applyOrgDemoContent(prisma, {
    orgId: org.id,
    ownerUserId: user.id,
    memberUserId: testUser.id,
  });

  await seedDemoAuditLogs(prisma, {
    orgId: org.id,
    ownerUserId: user.id,
    memberUserId: testUser.id,
  });

  console.log("✅ Seed complete with mock data:");
  console.log("   - 8 Procedures with versions");
  console.log("   - 6 Error Reports (2 OPEN, 2 RESOLVED, 2 ARCHIVED)");
  console.log("   - 8 Ideas (2 NEW, 2 IN_PROGRESS, 2 COMPLETED, 2 ARCHIVED)");
  console.log("   - 6 News Posts (3 per team, 1 pinned per team)");
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
