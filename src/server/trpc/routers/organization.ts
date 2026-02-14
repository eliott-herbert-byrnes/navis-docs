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
import { getStripe } from "@/lib/stripe";

function isStripeResourceGone(error: unknown): boolean {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: string }).code;
    return code === "resource_missing";
  }
  return false;
}

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
          message: "Unauthorized, reauthenticate your current session",
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

      if (!updatedOrg) {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message:
            "Unable to update organization, try again or contact support",
        });
      }

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
          message: "You must be logged in, sign in and try again",
        });
      }

      const userId = ctx.user.id;

      const existingMembership = await ctx.db.orgMembership.findFirst({
        where: { userId },
      });

      if (existingMembership) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You already belong to an organization, leave it first or use a different account",
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
          message:
            "Organization with this name already exists, choose a different name",
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

      if (!org) {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message:
            "Failed to create organization, try again or contact customer support",
        });
      }

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
  // Mutation: Delete Organization
  deleteOrganization: adminProcedure
    .use(rateLimitMiddleware("organization-delete"))
    .input(z.void().optional())
    .mutation(async ({ ctx }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No organization found, reauthenticate your current session",
        });
      }

      if (ctx.org.stripeSubscriptionId) {
        try {
          await getStripe().subscriptions.cancel(ctx.org.stripeSubscriptionId);
        } catch (error) {
          if (isStripeResourceGone(error)) {
            // Subscription already canceled – proceed with org delete
          } else {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message:
                "Failed to cancel subscription. Try again or contact support.",
              cause: error,
            });
          }
        }
      }

      if (ctx.org.stripeCustomerId) {
        try {
          await getStripe().customers.del(ctx.org.stripeCustomerId);
        } catch (error) {
          if (isStripeResourceGone(error)) {
            // Customer already deleted – proceed
          } else {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message:
                "Failed to delete billing account, try again or contact support",
              cause: error,
            });
          }
        }
      }

      const deleted = await ctx.db.organization.delete({
        where: {
          id: ctx.org.id,
        },
      });

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message:
            "Failed to delete organization, try again or contact customer support",
        });
      }

      return {
        data: deleted,
      };
    }),
});
