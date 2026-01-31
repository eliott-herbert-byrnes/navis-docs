import {
  router,
  adminProcedure,
  rateLimitMiddleware,
  protectedProcedure,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createAuditLog } from "@/features/audit/utils/audit";
import { inngest } from "@/inngest/client";
import { OrgMembershipRole } from "@prisma/client";

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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        !ctx.membership ||
        !["ADMIN", "OWNER"].includes(ctx.membership.role) ||
        !ctx.org
      ) {
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
  createOrganization: protectedProcedure
    .use(rateLimitMiddleware("organization-create"))
    .input(
      z.object({
        name: z
          .string()
          .min(6, {
            message: "Organization name must be at least 6 characters",
          })
          .max(191, {
            message: "Organization name must be less than 191 characters",
          }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const userId = ctx.user.id;

      const existingMembership = await ctx.db.orgMembership.findFirst({
        where: { userId },
      });

      if (existingMembership) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already belong to an organization",
        });
      }

      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const existingOrg = await ctx.db.organization.findFirst({
        where: { slug },
      });

      if (existingOrg) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Organization with this name already exists",
        });
      }

      const org = await ctx.db.organization.create({
        data: {
          name: input.name,
          slug,
          ownerUserId: userId as string,
          plan: "business",
          entitlementsJSON: {
            maxProcedures: 100,
            maxDepartments: 3,
            maxTeamsPerDepartment: 1,
          },
        },
      });

      await ctx.db.orgMembership.create({
        data: {
          orgId: org.id,
          userId: userId as string,
          role: OrgMembershipRole.OWNER,
        },
      });

      try {
        await inngest.send({
          name: "onboarding/create-organization",
          data: {
            orgId: org.id,
            orgSlug: org.slug,
            orgName: org.name,
            orgOwnerUserId: userId,
          },
        });
      } catch (inngestError) {
        console.warn("Failed to send Inngest event:", inngestError);
      }

      return {
        data: org,
        message: "Organization created successfully",
      };
    }),
});
