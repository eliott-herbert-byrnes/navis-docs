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
// TODO: Process actions
  | "PROCESS_CREATED"
  | "PROCESS_RENAMED"
  | "PROCESS_DELETED"
  | "PROCESS_PUBLISHED"
  | "PROCESS_UNPUBLISHED"
  | "PROCESS_ARCHIVED"
  | "PROCESS_UNARCHIVED"
  | "PROCESS_EDITED"
// TODO: Category actions
  | "CATEGORY_CREATED"
  | "CATEGORY_RENAMED"
  | "CATEGORY_DELETED"
// TODO: NewsPost actions
// TODO: ErrorReport actions
// TODO: IngestionJob actions

export type AuditEntityType = "DEPARTMENT" | "TEAM" | "PROCESS" | "CATEGORY";

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

export async function getAuditLogs(
  orgId: string,
  actorId?: string,
  options?: {
    entityType?: AuditEntityType;
    entityId?: string;
    limit?: number;
    offset?: number;
  }
) {
  return await prisma.auditLog.findMany({
    where: {
      orgId,
      ...(actorId && { actorId }),
      ...(options?.entityType && { entityType: options.entityType }),
      ...(options?.entityId && { entityId: options.entityId }),
    },
    orderBy: { at: "desc" },
    take: options?.limit ?? 50,
    skip: options?.offset ?? 0,
  });
}
