import {
  router,
  adminProcedure,
  rateLimitMiddleware,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createAuditLog } from "@/features/audit/utils/audit";

export const organizationRouter = router({
  //Mutate: Update organization
  renameOrganization: adminProcedure
    .use(rateLimitMiddleware("organization-update"))
    .input(
      z.object({
        orgId: z.string().min(1, { message: "Organization ID is required" }),
        orgName: z
          .string()
          .min(1, { message: "Organization name is required" })
          .max(100, {
            message: "Organization name must be less than 100 characters",
          }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.membership?.role !== "ADMIN" || !ctx.org) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const beforeState = {
        id: ctx.org.id,
        name: ctx.org.name,
      };

      const updatedOrg = await ctx.db.organization.update({
        where: { id: input.orgId },
        data: { name: input.orgName },
      });

      await createAuditLog({
        orgId: input.orgId,
        actorId: ctx?.user?.id ?? "",
        action: "ORGANIZATION_UPDATED",
        entityType: "ORGANIZATION",
        entityId: ctx.org.id,
        beforeJSON: beforeState,
        afterJSON: {
          id: updatedOrg.id,
          name: updatedOrg.name,
        },
      });

      return {
        data: updatedOrg,
      };
    }),
});
