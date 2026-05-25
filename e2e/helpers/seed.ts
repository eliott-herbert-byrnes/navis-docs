import "dotenv/config";
import {
  OrgMembershipRole,
  OrgPlan,
  PrismaClient,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { canonicalEmail } from "../../src/lib/email-canonical";

export const E2E_USER_EMAIL = "e2e-admin@test.local";
export const E2E_ORG_NAME = "E2E Test Organization";
export const E2E_DEPARTMENT_NAME = "Operations";
export const E2E_TEAM_NAME = "General";

export const E2E_USER_ID = "00000000-0000-4000-a000-000000000001";
export const E2E_ORG_ID = "00000000-0000-4000-a000-000000000002";
export const E2E_DEPARTMENT_ID = "00000000-0000-4000-a000-000000000003";
export const E2E_TEAM_ID = "00000000-0000-4000-a000-000000000004";

function createPrisma() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export async function seedE2eFixtures() {
  const prisma = createPrisma();

  try {
    await prisma.procedure.updateMany({
      where: { teamId: E2E_TEAM_ID },
      data: { pendingVersionId: null, publishedVersionId: null },
    });
    await prisma.procedureVersion.deleteMany({
      where: { procedure: { teamId: E2E_TEAM_ID } },
    });
    await prisma.procedure.deleteMany({ where: { teamId: E2E_TEAM_ID } });
    await prisma.category.deleteMany({ where: { teamId: E2E_TEAM_ID } });
    await prisma.ingestionJob.deleteMany({ where: { orgId: E2E_ORG_ID } });
    await prisma.emailOTP.deleteMany({
      where: { email: E2E_USER_EMAIL },
    });

    await prisma.user.upsert({
      where: { id: E2E_USER_ID },
      update: {
        email: E2E_USER_EMAIL,
        canonicalEmail: canonicalEmail(E2E_USER_EMAIL),
        name: "E2E Admin",
      },
      create: {
        id: E2E_USER_ID,
        email: E2E_USER_EMAIL,
        canonicalEmail: canonicalEmail(E2E_USER_EMAIL),
        name: "E2E Admin",
        emailVerified: new Date(),
      },
    });

    await prisma.organization.upsert({
      where: { id: E2E_ORG_ID },
      update: {
        name: E2E_ORG_NAME,
        slug: "e2e-test-org",
        ownerUserId: E2E_USER_ID,
        plan: OrgPlan.pro,
      },
      create: {
        id: E2E_ORG_ID,
        name: E2E_ORG_NAME,
        slug: "e2e-test-org",
        ownerUserId: E2E_USER_ID,
        plan: OrgPlan.pro,
      },
    });

    await prisma.orgMembership.upsert({
      where: {
        orgId_userId: {
          orgId: E2E_ORG_ID,
          userId: E2E_USER_ID,
        },
      },
      update: { role: OrgMembershipRole.OWNER },
      create: {
        orgId: E2E_ORG_ID,
        userId: E2E_USER_ID,
        role: OrgMembershipRole.OWNER,
      },
    });

    await prisma.department.upsert({
      where: { id: E2E_DEPARTMENT_ID },
      update: { name: E2E_DEPARTMENT_NAME, orgId: E2E_ORG_ID },
      create: {
        id: E2E_DEPARTMENT_ID,
        orgId: E2E_ORG_ID,
        name: E2E_DEPARTMENT_NAME,
      },
    });

    await prisma.team.upsert({
      where: { id: E2E_TEAM_ID },
      update: {
        name: E2E_TEAM_NAME,
        departmentId: E2E_DEPARTMENT_ID,
      },
      create: {
        id: E2E_TEAM_ID,
        departmentId: E2E_DEPARTMENT_ID,
        name: E2E_TEAM_NAME,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function resetE2eDraftProcedures() {
  const prisma = createPrisma();
  try {
    await prisma.procedure.updateMany({
      where: { teamId: E2E_TEAM_ID },
      data: { pendingVersionId: null, publishedVersionId: null },
    });
    await prisma.procedureVersion.deleteMany({
      where: { procedure: { teamId: E2E_TEAM_ID } },
    });
    await prisma.procedure.deleteMany({ where: { teamId: E2E_TEAM_ID } });
    await prisma.category.deleteMany({ where: { teamId: E2E_TEAM_ID } });
  } finally {
    await prisma.$disconnect();
  }
}
