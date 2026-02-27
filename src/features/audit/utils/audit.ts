"use server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type AuditAction =
  // Department actions
  | "DEPARTMENT_CREATED"
  | "DEPARTMENT_RENAMED"
  | "DEPARTMENT_DELETED"
  // Team actions
  | "TEAM_CREATED"
  | "TEAM_RENAMED"
  | "TEAM_DELETED"
  //  Procedure actions
  | "PROCEDURE_CREATED"
  | "PROCEDURE_RENAMED"
  | "PROCEDURE_DELETED"
  | "PROCEDURES_DELETED"
  | "PROCEDURE_PUBLISHED"
  | "PROCEDURE_UNPUBLISHED"
  | "PROCEDURE_ARCHIVED"
  | "PROCEDURE_UNARCHIVED"
  | "PROCEDURE_EDITED"
  | "PROCEDURE_CATEGORY_UPDATED"
  // TODO: IngestionJob actions
  | "PROCEDURE_IMPORTED"
  // Category actions
  | "CATEGORY_CREATED"
  | "CATEGORY_RENAMED"
  | "CATEGORY_DELETED"
  // User actions
  | "USER_CREATED"
  | "USER_RENAMED"
  | "USER_DELETED"
  // Update Role
  | "USER_ROLE_CHANGED"
  // Organization actions
  | "ORGANIZATION_UPDATED"
  | "ORGANIZATION_DELETED"
  // Address actions
  | "ADDRESS_CREATED"
  | "ADDRESS_UPDATED"
  | "ADDRESS_DELETED"
  // News Actions
  | "NEWS_CREATED"
  | "NEWS_DELETED";

export type AuditEntityType =
  | "DEPARTMENT"
  | "TEAM"
  | "PROCEDURE"
  | "CATEGORY"
  | "USER"
  | "USER_ROLE"
  | "ORGANIZATION"
  | "ADDRESS"
  | "NEWS"
  | "INGESTION_JOB";

type AuditLogData = {
  orgId: string;
  actorId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  beforeJSON?: Prisma.JsonValue;
  afterJSON?: Prisma.JsonValue;
};

export async function createAuditLog(data: AuditLogData) {
  try {
    const {
      orgId,
      actorId,
      action,
      entityType,
      entityId,
      beforeJSON,
      afterJSON,
    } = data;
    await prisma.auditLog.create({
      data: {
        orgId,
        actorId,
        action,
        entityType,
        entityId,
        beforeJSON: beforeJSON ? JSON.parse(JSON.stringify(beforeJSON)) : null,
        afterJSON: afterJSON ? JSON.parse(JSON.stringify(afterJSON)) : null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log", error);
    return null;
  }
}

export async function getAuditLogsWithCount(
  orgId: string,
  options?: {
    actorId?: string;
    search?: string;
    entityType?: AuditEntityType;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  },
) {
  const where: Prisma.AuditLogWhereInput = {
    orgId,
    // filter by user / entity
    ...(options?.actorId && { actorId: options.actorId }),
    ...(options?.entityType && { entityType: options.entityType }),
    ...(options?.entityId && { entityId: options.entityId }),

    // Date filtering
    ...(options?.startDate || options?.endDate
      ? {
          at: {
            ...(options.startDate && { gte: options.startDate }),
            ...(options.endDate && { lte: options.endDate }),
          },
        }
      : {}),

    // Search across multiple fields
    ...(options?.search && {
      OR: [
        { entityId: { contains: options.search, mode: "insensitive" } },
        { action: { contains: options.search, mode: "insensitive" } },
        { actorId: { contains: options.search, mode: "insensitive" } },
      ],
    }),
  };

  const [logs, totalCount] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      orderBy: { at: "desc" },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, totalCount };
}
