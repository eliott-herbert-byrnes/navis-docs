import {
  buildAuditExportJsonEnvelope,
  stringifyAuditExportJson,
} from "@/features/audit/utils/audit-export-envelope";
import { parseAuditExportFiltersFromJson } from "@/features/audit/utils/audit-export-filters";
import {
  getAuditLogsWithCountForExport,
  logAuditExportFailed,
  logAuditExportReady,
} from "@/features/audit/utils/audit";
import { prisma } from "@/lib/prisma";
import {
  AUDIT_EXPORTS_BUCKET,
  auditExportObjectPath,
} from "@/lib/supabase/audit-exports-storage";
import { storage } from "@/lib/storage";

const PAGE_SIZE = 500;

export type RunAuditExportParams = {
  jobId: string;
  orgId: string;
  actorId: string;
};

export async function runAuditExport({
  jobId,
  orgId,
}: RunAuditExportParams): Promise<
  | { skipped: true; reason: string }
  | { ok: true; fileKey: string }
  | { ok: false; error: string }
> {
  const job = await prisma.auditExportJob.findFirst({
    where: { id: jobId, orgId },
  });

  if (!job) {
    return { skipped: true, reason: "job_not_found" };
  }

  if (job.status === "READY" && job.fileKey) {
    return { skipped: true, reason: "already_ready" };
  }

  try {
    await prisma.auditExportJob.update({
      where: { id: jobId },
      data: { status: "PROCESSING", error: null },
    });

    const filters = parseAuditExportFiltersFromJson(job.filtersJson);

    const allLogs: Awaited<
      ReturnType<typeof getAuditLogsWithCountForExport>
    >["logs"] = [];
    let offset = 0;

    for (;;) {
      const { logs } = await getAuditLogsWithCountForExport(orgId, filters, {
        limit: PAGE_SIZE,
        offset,
        orderAt: "asc",
      });
      if (logs.length === 0) break;
      allLogs.push(...logs);
      offset += logs.length;
      if (logs.length < PAGE_SIZE) break;
    }

    const envelope = buildAuditExportJsonEnvelope({
      meta: {
        orgId,
        requestedByUserId: job.requestedByUserId,
        jobId,
      },
      filters,
      logs: allLogs,
    });

    const body = stringifyAuditExportJson(envelope);
    const buffer = Buffer.from(body, "utf-8");
    const fileKey = auditExportObjectPath(orgId, jobId);

    await storage.upload(AUDIT_EXPORTS_BUCKET, fileKey, buffer, {
      contentType: "application/json",
      upsert: true,
    });

    await prisma.auditExportJob.update({
      where: { id: jobId },
      data: {
        status: "READY",
        fileKey,
        error: null,
      },
    });

    await logAuditExportReady({
      orgId,
      actorId: job.requestedByUserId,
      jobId,
      fileKey,
    });

    return { ok: true, fileKey };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Audit export failed unexpectedly";

    await prisma.auditExportJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        error: message,
      },
    });

    await logAuditExportFailed({
      orgId,
      actorId: job.requestedByUserId,
      jobId,
      error: message,
    });

    return { ok: false, error: message };
  }
}
