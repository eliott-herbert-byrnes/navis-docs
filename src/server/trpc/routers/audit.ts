import { router, orgAdminProcedure } from "@/server/trpc/init";
import { getAuditLogsWithCount } from "@/features/audit/utils/audit";
import { z } from "zod";

export const auditRouter = router({
  getRecent: orgAdminProcedure
    .input(z.object({ limit: z.number().max(10).default(5) }))
    .query(async ({ ctx, input }) => {
      const { logs } = await getAuditLogsWithCount(ctx.org.id, {
        limit: input.limit,
      });
      return { logs };
    }),
});