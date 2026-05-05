import {
  getAuditLogsWithCount,
  logAuditExportDownloaded,
  logAuditExportRequested,
} from "@/features/audit/utils/audit";
import type { AuditExportFilterSnapshot } from "@/features/audit/utils/audit-export-filters";
import { storage } from "@/lib/storage";
import { after } from "next/server";
import {
  AUDIT_EXPORTS_BUCKET,
  AUDIT_EXPORT_SIGNED_URL_TTL_SECONDS,
} from "@/lib/supabase/audit-exports-storage";
import {
  orgAdminProcedure,
  orgAdminActiveProcedure,
  rateLimitProcedureMiddleware,
  router,
} from "@/server/trpc/init";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const auditEntityTypeEnum = z.enum([
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
]);

const startAuditExportInput = z.object({
  search: z.string().optional(),
  entityType: auditEntityTypeEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

function toFilterSnapshot(
  input: z.infer<typeof startAuditExportInput>,
): AuditExportFilterSnapshot {
  return {
    search: input.search ?? null,
    entityType: input.entityType ?? null,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
  };
}

export const auditRouter = router({
  getRecent: orgAdminProcedure
    .input(z.object({ limit: z.number().max(10).default(5) }))
    .query(async ({ ctx, input }) => {
      const { logs } = await getAuditLogsWithCount(ctx.org.id, {
        limit: input.limit,
      });
      return { logs };
    }),

  startAuditExport: orgAdminActiveProcedure
    .use(rateLimitProcedureMiddleware("audit-export-start"))
    .input(startAuditExportInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }
      const userId = ctx.user.id;
      const orgId = ctx.org!.id;
      const snapshot = toFilterSnapshot(input);

      const active = await ctx.db.auditExportJob.findFirst({
        where: {
          orgId,
          requestedByUserId: userId,
          status: { in: ["QUEUED", "PROCESSING"] },
        },
        orderBy: { createdAt: "desc" },
      });

      if (active) {
        return { jobId: active.id, alreadyRunning: true };
      }

      const job = await ctx.db.auditExportJob.create({
        data: {
          orgId,
          requestedByUserId: userId,
          filtersJson: snapshot as Prisma.InputJsonValue,
          status: "QUEUED",
        },
      });

      await logAuditExportRequested({
        orgId,
        actorId: userId,
        jobId: job.id,
        filtersSnapshot: snapshot,
      });

      after(async () => {
        const { runAuditExport } = await import(
          "@/features/audit/jobs/run-audit-export"
        );
        await runAuditExport({
          jobId: job.id,
          orgId,
          actorId: userId,
        });
      });

      return { jobId: job.id, alreadyRunning: false };
    }),

  getAuditExportStatus: orgAdminProcedure
    .use(rateLimitProcedureMiddleware("audit-export-status"))
    .input(z.object({ jobId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const job = await ctx.db.auditExportJob.findFirst({
        where: {
          id: input.jobId,
          orgId: ctx.org!.id,
          requestedByUserId: ctx.user.id,
        },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Export job not found",
        });
      }

      let downloadUrl: string | undefined;

      if (job.status === "READY" && job.fileKey) {
        try {
          downloadUrl = await storage.createSignedUrl(
            AUDIT_EXPORTS_BUCKET,
            job.fileKey,
            AUDIT_EXPORT_SIGNED_URL_TTL_SECONDS,
          );
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not create download link",
          });
        }
      }

      return {
        status: job.status,
        error: job.error,
        downloadUrl,
      };
    }),

  ackAuditExportDownloaded: orgAdminActiveProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const job = await ctx.db.auditExportJob.findFirst({
        where: {
          id: input.jobId,
          orgId: ctx.org!.id,
          requestedByUserId: ctx.user.id,
        },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Export job not found",
        });
      }

      await logAuditExportDownloaded({
        orgId: ctx.org!.id,
        actorId: ctx.user.id,
        jobId: job.id,
      });

      return { ok: true as const };
    }),
});
