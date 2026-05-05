import { createAuditLog } from "@/features/audit/utils/audit";
import { generatePlainTextFromTiptap } from "@/features/procedures/utils/generate-plain-text-from-tiptap";
import { makeSlugFromTitle } from "@/features/procedures/utils/make-slug-from-title";
import { storage } from "@/lib/storage";
import { after } from "next/server";
import {
  router,
  orgAdminProcedure,
  orgAdminActiveProcedure,
  rateLimitProcedureMiddleware,
} from "@/server/trpc/init";
import { JsonObject } from "@prisma/client/runtime/client";
import { ProcedureStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const IMPORTS_BUCKET =
  process.env.SUPABASE_PROCEDURE_IMPORTS_BUCKET ?? "procedure-imports";

const startImportSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  teamId: z.string().min(1, { message: "Team is required" }),
  departmentId: z.string().min(1, { message: "Department is required" }),
  fileKey: z.string().min(1, { message: "File is required" }),
  sourceType: z.enum(["FILE_TXT", "FILE_DOCX"]),
});

export const ingestionRouter = router({
  startImport: orgAdminActiveProcedure
    .use(rateLimitProcedureMiddleware("procedure-import"))
    .input(startImportSchema)
    .mutation(async ({ ctx, input }) => {
      const { title, teamId, departmentId, fileKey, sourceType } = input;

      const team = await ctx.db.team.findFirst({
        where: { id: teamId, departmentId },
      });
      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found, refresh the page or select a valid team",
        });
      }

      const existingTitle = await ctx.db.procedure.findFirst({
        where: {
          title,
          team: {
            department: { orgId: ctx.org!.id },
          },
        },
      });
      if (existingTitle) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This title has already been taken, choose another",
        });
      }

      const procedure = await ctx.db.procedure.create({
        data: {
          teamId,
          title,
          slug: makeSlugFromTitle(title),
          status: ProcedureStatus.DRAFT,
          style: "RAW",
          description: null,
        },
      });

      const job = await ctx.db.ingestionJob.create({
        data: {
          orgId: ctx.org!.id,
          procedureId: procedure.id,
          sourceType,
          fileKey,
          status: "QUEUED",
        },
      });

      const orgId = ctx.org!.id;
      const actorId = ctx.user?.id ?? "";
      const procedureId = procedure.id;

      after(async () => {
        const { runImportProcedure } = await import(
          "@/features/procedures/jobs/run-import-procedure"
        );
        await runImportProcedure({
          jobId: job.id,
          fileKey,
          orgId,
          procedureId,
          actorId,
          sourceType,
        });
      });

      return { jobId: job.id };
    }),

  getJobStatus: orgAdminProcedure
    .use(rateLimitProcedureMiddleware("procedure-import-query-status"))
    .input(z.object({ jobId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.ingestionJob.findFirst({
        where: {
          id: input.jobId,
          orgId: ctx.org!.id,
        },
        include: {
          procedure: {
            select: {
              id: true,
              title: true,
              teamId: true,
              team: { select: { departmentId: true } },
            },
          },
          outputVersion: {
            select: { contentJSON: true },
          },
        },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Import job not found",
        });
      }

      let contentPreview: string | null = null;
      let characterCount: number | null = null;

      if (job.status === "READY" && job.outputVersion?.contentJSON) {
        const fullText = generatePlainTextFromTiptap(
          job.outputVersion.contentJSON as JsonObject,
        );
        characterCount = fullText.length;
        contentPreview = fullText.slice(0, 400);
      }

      const filename = job.fileKey
        ? (job.fileKey.split("/").pop() ?? null)
        : null;

      return {
        status: job.status,
        error: job.error,
        procedure: job.procedure,
        contentPreview,
        characterCount,
        filename,
      };
    }),

  approveImport: orgAdminActiveProcedure
    .use(rateLimitProcedureMiddleware("procedure-import-approve"))
    .input(z.object({ jobId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.ingestionJob.findFirst({
        where: {
          id: input.jobId,
          orgId: ctx.org!.id,
        },
        include: {
          procedure: {
            select: {
              id: true,
              teamId: true,
              team: { select: { departmentId: true } },
            },
          },
        },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Import job not found",
        });
      }

      if (job.status !== "READY" || !job.outputVersionId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Import is not ready to approve. Wait for processing to complete.",
        });
      }

      await ctx.db.procedure.update({
        where: { id: job.procedureId },
        data: { pendingVersionId: job.outputVersionId },
      });

      await createAuditLog({
        orgId: ctx.org!.id,
        actorId: ctx.user?.id ?? "",
        action: "PROCEDURE_IMPORTED",
        entityType: "INGESTION_JOB",
        entityId: job.id,
        afterJSON: {
          procedureId: job.procedureId,
          outputVersionId: job.outputVersionId,
        },
      });

      if (job.fileKey) {
        try {
          await storage.remove(IMPORTS_BUCKET, [job.fileKey]);
        } catch (err) {
          console.error("Failed to delete import file from storage:", err);
        }
      }

      return {
        procedureId: job.procedureId,
        teamId: job.procedure!.teamId,
        departmentId: job.procedure!.team.departmentId,
      };
    }),

  rejectImport: orgAdminActiveProcedure
    .use(rateLimitProcedureMiddleware("procedure-import-reject"))
    .input(z.object({ jobId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.ingestionJob.findFirst({
        where: {
          id: input.jobId,
          orgId: ctx.org!.id,
        },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Import job not found",
        });
      }

      const procedureId = job.procedureId;
      const fileKey = job.fileKey;

      if (fileKey) {
        try {
          await storage.remove(IMPORTS_BUCKET, [fileKey]);
        } catch (err) {
          console.error("Failed to delete import file from storage:", err);
        }
      }

      await ctx.db.procedure.delete({
        where: { id: procedureId },
      });

      return { success: true };
    }),
});
