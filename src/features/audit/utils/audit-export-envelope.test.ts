import { describe, expect, it } from "vitest";
import {
  AUDIT_EXPORT_JSON_SCHEMA_VERSION,
  auditLogToExportJsonRow,
  buildAuditExportJsonEnvelope,
  snapshotToExportJsonFilters,
  stringifyAuditExportJson,
} from "./audit-export-envelope";

describe("snapshotToExportJsonFilters", () => {
  it("uses explicit nulls for missing keys", () => {
    expect(snapshotToExportJsonFilters({})).toEqual({
      search: null,
      entityType: null,
      startDate: null,
      endDate: null,
    });
  });
});

describe("buildAuditExportJsonEnvelope", () => {
  it("produces schema v1 with meta, filters, and log rows", () => {
    const at = new Date("2026-04-07T12:00:00.000Z");
    const envelope = buildAuditExportJsonEnvelope({
      meta: {
        orgId: "org-1",
        requestedByUserId: "user-1",
        jobId: "job-1",
      },
      filters: { search: "x", entityType: null },
      logs: [
        {
          id: "log-1",
          orgId: "org-1",
          actorId: "user-1",
          action: "NEWS_CREATED",
          entityType: "NEWS",
          entityId: "news-1",
          at,
          beforeJSON: null,
          afterJSON: { title: "Hi" },
        },
      ],
      generatedAt: at,
    });

    expect(envelope.schemaVersion).toBe(AUDIT_EXPORT_JSON_SCHEMA_VERSION);
    expect(envelope.generatedAt).toBe("2026-04-07T12:00:00.000Z");
    expect(envelope.meta).toEqual({
      orgId: "org-1",
      requestedByUserId: "user-1",
      jobId: "job-1",
    });
    expect(envelope.filters).toEqual({
      search: "x",
      entityType: null,
      startDate: null,
      endDate: null,
    });
    expect(envelope.logs).toHaveLength(1);
    expect(envelope.logs[0]).toMatchObject({
      id: "log-1",
      action: "NEWS_CREATED",
      at: "2026-04-07T12:00:00.000Z",
    });
  });

  it("serializes to parseable JSON", () => {
    const envelope = buildAuditExportJsonEnvelope({
      meta: { orgId: "o", requestedByUserId: "u", jobId: "j" },
      filters: {},
      logs: [],
    });
    const s = stringifyAuditExportJson(envelope);
    const parsed = JSON.parse(s) as typeof envelope;
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.logs).toEqual([]);
  });
});

describe("auditLogToExportJsonRow", () => {
  it("maps Prisma-shaped row to export row", () => {
    const row = auditLogToExportJsonRow({
      id: "1",
      orgId: "o",
      actorId: "a",
      action: "X",
      entityType: "Y",
      entityId: "z",
      at: new Date("2026-01-01T00:00:00.000Z"),
      beforeJSON: null,
      afterJSON: null,
    });
    expect(row.at).toBe("2026-01-01T00:00:00.000Z");
  });
});
