import type { AuditEntityType } from "./audit";

/**
 * Snapshot stored on {@link AuditExportJob} and echoed in export JSON `filters`.
 * Dates are ISO strings or null (calendar dates use YYYY-MM-DD; normalized on read).
 */
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

/**
 * Normalize date range for audit export queries (UTC).
 * - Calendar date strings (`YYYY-MM-DD`): start → start-of-day UTC; end → end-of-day UTC.
 * - Full ISO datetimes: used as-is (instant semantics).
 */
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

/** Maps stored export filters to the same query shape as {@link getAuditLogsWithCount} (Audit page semantics). */
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
