import { describe, expect, it } from "vitest";
import {
  buildAuditExportQueryOptions,
  normalizeAuditExportDateRange,
} from "./audit-export-filters";

describe("normalizeAuditExportDateRange", () => {
  it("treats YYYY-MM-DD start as UTC start of day", () => {
    const { startDate } = normalizeAuditExportDateRange({
      startDate: "2026-04-07",
    });
    expect(startDate?.toISOString()).toBe("2026-04-07T00:00:00.000Z");
  });

  it("treats YYYY-MM-DD end as UTC end of day", () => {
    const { endDate } = normalizeAuditExportDateRange({
      endDate: "2026-04-07",
    });
    expect(endDate?.toISOString()).toBe("2026-04-07T23:59:59.999Z");
  });

  it("passes through full ISO datetimes", () => {
    const { startDate, endDate } = normalizeAuditExportDateRange({
      startDate: "2026-04-07T08:30:00.000Z",
      endDate: "2026-04-08T15:00:00.000Z",
    });
    expect(startDate?.toISOString()).toBe("2026-04-07T08:30:00.000Z");
    expect(endDate?.toISOString()).toBe("2026-04-08T15:00:00.000Z");
  });
});

describe("buildAuditExportQueryOptions", () => {
  it("maps snapshot fields to query options with normalized dates", () => {
    const q = buildAuditExportQueryOptions({
      search: "foo",
      entityType: "PROCEDURE",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    });
    expect(q.search).toBe("foo");
    expect(q.entityType).toBe("PROCEDURE");
    expect(q.startDate?.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(q.endDate?.toISOString()).toBe("2026-01-31T23:59:59.999Z");
  });

  it("omits empty search and entity type", () => {
    const q = buildAuditExportQueryOptions({
      search: "",
      entityType: null,
    });
    expect(q.search).toBeUndefined();
    expect(q.entityType).toBeUndefined();
  });
});
