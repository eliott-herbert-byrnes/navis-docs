import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { AuditEntityType } from "./audit";

const auditExportFilterSnapshotSchema = z.object({
  search: z.string().nullable().optional(),
  entityType: z
    .enum([
      "DEPARTMENT",
      "TEAM",
      "PROCEDURE",
      "CATEGORY",
      "USER",
      "USER_ROLE",
      "ORGANIZATION",
      "ADDRESS",
      "NEWS",
      "INVITATION",
      "INGESTION_JOB",
    ])
    .nullable()
    .optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

/** Parse `AuditExportJob.filtersJson` from the DB (best-effort; invalid → empty snapshot). */
export function parseAuditExportFiltersFromJson(
  json: Prisma.JsonValue,
): AuditExportFilterSnapshot {
  const parsed = auditExportFilterSnapshotSchema.safeParse(json);
  if (!parsed.success) return {};
  return parsed.data;
}

export type AuditExportFilterSnapshot = {
  search?: string | null;
  entityType?: AuditEntityType | null;
  startDate?: string | null;
  endDate?: string | null;
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function utcStartOfDay(y: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(y, monthIndex, day, 0, 0, 0, 0));
}

function utcEndOfDay(y: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(y, monthIndex, day, 23, 59, 59, 999));
}

function parseCalendarDateOnlyString(s: string): { y: number; m: number; d: number } | null {
  const t = s.trim();
  if (!DATE_ONLY.test(t)) return null;
  const [ys, ms, ds] = t.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  return { y, m: m - 1, d };
}


export function normalizeAuditExportDateRange(input: {
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}): { startDate?: Date; endDate?: Date } {
  const out: { startDate?: Date; endDate?: Date } = {};

  if (input.startDate != null && input.startDate !== "") {
    if (input.startDate instanceof Date) {
      const t = input.startDate.getTime();
      if (!Number.isNaN(t)) out.startDate = input.startDate;
    } else {
      const s = String(input.startDate);
      const cal = parseCalendarDateOnlyString(s);
      if (cal) {
        out.startDate = utcStartOfDay(cal.y, cal.m, cal.d);
      } else {
        const d = new Date(s);
        if (!Number.isNaN(d.getTime())) out.startDate = d;
      }
    }
  }

  if (input.endDate != null && input.endDate !== "") {
    if (input.endDate instanceof Date) {
      const t = input.endDate.getTime();
      if (!Number.isNaN(t)) out.endDate = input.endDate;
    } else {
      const s = String(input.endDate);
      const cal = parseCalendarDateOnlyString(s);
      if (cal) {
        out.endDate = utcEndOfDay(cal.y, cal.m, cal.d);
      } else {
        const d = new Date(s);
        if (!Number.isNaN(d.getTime())) out.endDate = d;
      }
    }
  }

  return out;
}


export function buildAuditExportQueryOptions(filters: AuditExportFilterSnapshot): {
  search?: string;
  entityType?: AuditEntityType;
  startDate?: Date;
  endDate?: Date;
} {
  const { startDate, endDate } = normalizeAuditExportDateRange({
    startDate: filters.startDate ?? undefined,
    endDate: filters.endDate ?? undefined,
  });

  const search =
    filters.search != null && String(filters.search).trim() !== ""
      ? String(filters.search)
      : undefined;

  const entityType =
    filters.entityType != null && String(filters.entityType).trim() !== ""
      ? (filters.entityType as AuditEntityType)
      : undefined;

  return {
    ...(search !== undefined && { search }),
    ...(entityType !== undefined && { entityType }),
    ...(startDate !== undefined && { startDate }),
    ...(endDate !== undefined && { endDate }),
  };
}
