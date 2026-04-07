import type { Prisma } from "@prisma/client";
import type { AuditExportFilterSnapshot } from "@/features/audit/utils/audit-export-filters";

/** Bump when the export JSON shape changes in a breaking way. */
export const AUDIT_EXPORT_JSON_SCHEMA_VERSION = 1 as const;

export type AuditExportJsonFilters = {
  search: string | null;
  entityType: string | null;
  startDate: string | null;
  endDate: string | null;
};

export type AuditExportJsonLogRow = {
  id: string;
  orgId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  /** ISO 8601 */
  at: string;
  beforeJSON: Prisma.JsonValue | null;
  afterJSON: Prisma.JsonValue | null;
};

export type AuditExportJsonEnvelope = {
  schemaVersion: typeof AUDIT_EXPORT_JSON_SCHEMA_VERSION;
  generatedAt: string;
  meta: {
    orgId: string;
    requestedByUserId: string;
    jobId: string;
  };
  filters: AuditExportJsonFilters;
  logs: AuditExportJsonLogRow[];
};

export function snapshotToExportJsonFilters(
  snapshot: AuditExportFilterSnapshot,
): AuditExportJsonFilters {
  return {
    search: snapshot.search ?? null,
    entityType: snapshot.entityType ?? null,
    startDate: snapshot.startDate ?? null,
    endDate: snapshot.endDate ?? null,
  };
}

/** Maps a DB row to the plain JSON shape (matches `AuditLog` columns). */
export function auditLogToExportJsonRow(log: {
  id: string;
  orgId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  at: Date;
  beforeJSON: Prisma.JsonValue | null;
  afterJSON: Prisma.JsonValue | null;
}): AuditExportJsonLogRow {
  return {
    id: log.id,
    orgId: log.orgId,
    actorId: log.actorId,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    at: log.at.toISOString(),
    beforeJSON: log.beforeJSON ?? null,
    afterJSON: log.afterJSON ?? null,
  };
}

export function buildAuditExportJsonEnvelope(input: {
  meta: AuditExportJsonEnvelope["meta"];
  filters: AuditExportFilterSnapshot;
  logs: Parameters<typeof auditLogToExportJsonRow>[0][];
  generatedAt?: Date;
}): AuditExportJsonEnvelope {
  return {
    schemaVersion: AUDIT_EXPORT_JSON_SCHEMA_VERSION,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    meta: input.meta,
    filters: snapshotToExportJsonFilters(input.filters),
    logs: input.logs.map(auditLogToExportJsonRow),
  };
}

/** Stable JSON for upload (compact, UTF-8). */
export function stringifyAuditExportJson(envelope: AuditExportJsonEnvelope): string {
  return JSON.stringify(envelope);
}
