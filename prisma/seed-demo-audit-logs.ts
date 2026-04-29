import type { Prisma, PrismaClient } from "@prisma/client";

export type SeedDemoAuditLogsInput = {
  orgId: string;
  ownerUserId: string;
  memberUserId: string;
};

/**
 * Inserts illustrative audit rows for the demo org after `applyOrgDemoContent`.
 * Uses direct `createMany` (not `createAuditLog`) because runtime audit writes are skipped for `DEMO_ORG_ID`.
 */
export async function seedDemoAuditLogs(
  prisma: PrismaClient,
  { orgId, ownerUserId, memberUserId }: SeedDemoAuditLogsInput,
): Promise<void> {
  const department = await prisma.department.findFirst({
    where: { orgId },
    orderBy: { name: "asc" },
  });
  const team = await prisma.team.findFirst({
    where: { department: { orgId } },
    orderBy: { name: "asc" },
  });
  const category = await prisma.category.findFirst({
    where: { team: { department: { orgId } } },
    orderBy: { sortOrder: "asc" },
  });
  const procedure = await prisma.procedure.findFirst({
    where: { team: { department: { orgId } } },
    orderBy: { title: "asc" },
  });
  const memberMembership = await prisma.orgMembership.findFirst({
    where: { orgId, userId: memberUserId },
  });

  if (!department || !team || !category || !procedure) {
    console.warn(
      "seedDemoAuditLogs: skipped — demo org missing department, team, category, or procedure",
    );
    return;
  }

  const rows: Prisma.AuditLogCreateManyInput[] = [
    {
      orgId,
      actorId: ownerUserId,
      action: "ORGANIZATION_UPDATED",
      entityType: "ORGANIZATION",
      entityId: orgId,
      at: new Date("2024-09-02T14:30:00.000Z"),
      beforeJSON: { name: "Acme Corp (draft)" },
      afterJSON: { name: "Demo Organization" },
    },
    {
      orgId,
      actorId: ownerUserId,
      action: "DEPARTMENT_CREATED",
      entityType: "DEPARTMENT",
      entityId: department.id,
      at: new Date("2024-09-05T10:15:00.000Z"),
      afterJSON: { name: department.name },
    },
    {
      orgId,
      actorId: ownerUserId,
      action: "TEAM_CREATED",
      entityType: "TEAM",
      entityId: team.id,
      at: new Date("2024-09-05T11:00:00.000Z"),
      afterJSON: { name: team.name, departmentId: department.id },
    },
    {
      orgId,
      actorId: ownerUserId,
      action: "CATEGORY_CREATED",
      entityType: "CATEGORY",
      entityId: category.id,
      at: new Date("2024-09-06T09:20:00.000Z"),
      afterJSON: { name: category.name, teamId: team.id },
    },
    {
      orgId,
      actorId: ownerUserId,
      action: "PROCEDURE_CREATED",
      entityType: "PROCEDURE",
      entityId: procedure.id,
      at: new Date("2024-09-07T16:45:00.000Z"),
      afterJSON: { title: procedure.title, teamId: team.id },
    },
    {
      orgId,
      actorId: ownerUserId,
      action: "PROCEDURE_PUBLISHED",
      entityType: "PROCEDURE",
      entityId: procedure.id,
      at: new Date("2024-09-08T08:00:00.000Z"),
      afterJSON: { status: "PUBLISHED" },
    },
    {
      orgId,
      actorId: memberUserId,
      action: "PROCEDURE_EDITED",
      entityType: "PROCEDURE",
      entityId: procedure.id,
      at: new Date("2024-09-12T13:22:00.000Z"),
      beforeJSON: { summary: "v1" },
      afterJSON: { summary: "v2 — clarification on verification steps" },
    },
  ];

  if (memberMembership) {
    rows.push({
      orgId,
      actorId: ownerUserId,
      action: "USER_ROLE_CHANGED",
      entityType: "USER_ROLE",
      entityId: memberUserId,
      at: new Date("2024-09-09T12:00:00.000Z"),
      beforeJSON: "ADMIN",
      afterJSON: "MEMBER",
    });
  }

  await prisma.auditLog.createMany({ data: rows });
}
