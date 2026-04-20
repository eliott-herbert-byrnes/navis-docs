import {
  router,
  adminProcedure,
  orgAdminProcedure,
  orgAdminActiveProcedure,
  orgProcedure,
  rateLimitMiddleware,
  protectedProcedure,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sendTrialStartedEmail } from "@/app/api/stripe/data/crud-stripe";
import { createAuditLog } from "@/features/audit/utils/audit";
import {
  OrgMembershipRole,
  OrgPlan,
} from "@prisma/client";
import { encrypt } from "@/lib/crypto";
import { isCloud } from "@/lib/deploy-mode";
import { getStripe } from "@/lib/stripe";
import { after } from "next/server";

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

      const user = ctx.user;
      const userId = user.id;

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
          plan: OrgPlan.pro,
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

      let orgForResponse = org;

      if (isCloud()) {
        const priceId = process.env.STRIPE_DEFAULT_PRICE_ID;
        if (priceId) {
          try {
            const seatCount = Math.max(
              1,
              await ctx.db.orgMembership.count({
                where: { orgId: org.id },
              }),
            );

            const customer = await getStripe().customers.create({
              email: user.email ?? undefined,
              name: org.name,
              metadata: { orgId: org.id, orgSlug: org.slug },
            });

            const subscription = await getStripe().subscriptions.create({
              customer: customer.id,
              items: [{ price: priceId, quantity: seatCount }],
              trial_period_days: 14,
              payment_behavior: "default_incomplete",
              payment_settings: {
                save_default_payment_method: "on_subscription",
              },
              metadata: { orgId: org.id, orgSlug: org.slug },
            });

            const currentPeriodEndSec =
              subscription.items.data[0]?.current_period_end;

            orgForResponse = await ctx.db.organization.update({
              where: { id: org.id },
              data: {
                stripeCustomerId: customer.id,
                stripeSubscriptionId: subscription.id,
                stripeSubscriptionStatus: subscription.status,
                currentPeriodEnd: currentPeriodEndSec
                  ? new Date(currentPeriodEndSec * 1000)
                  : null,
              },
            });

            const ownerEmail = user.email;
            const ownerName = user.name ?? "there";
            if (ownerEmail) {
              const trialEndSec = subscription.trial_end;
              const trialEndsAt = trialEndSec
                ? new Date(trialEndSec * 1000)
                : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
              const billingUrl = baseUrl
                ? `${baseUrl}/subscription`
                : "/subscription";
              const orgNameForEmail = orgForResponse.name;

              after(async () => {
                try {
                  await sendTrialStartedEmail({
                    to: ownerEmail,
                    ownerName,
                    orgName: orgNameForEmail,
                    trialEndsAt,
                    billingUrl,
                  });
                } catch (err) {
                  console.error(
                    "[createOrganization] welcome email failed",
                    err,
                  );
                }
              });
            }
          } catch (error) {
            await ctx.db.orgMembership.deleteMany({
              where: { orgId: org.id },
            });
            await ctx.db.organization.delete({
              where: { id: org.id },
            });
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message:
                "Failed to set up billing. Please try again or contact support.",
              cause: error,
            });
          }
        }
      }

      return {
        data: orgForResponse,
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
  getAiKeyStatus: orgAdminProcedure.query(async ({ ctx }) => {
    if (!ctx.org) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No organization found",
      });
    }
    if (!isCloud()) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "AI key configuration is only available in cloud deployments",
      });
    }

    const org = await ctx.db.organization.findUnique({
      where: { id: ctx.org.id },
      select: { anthropicApiKey: true, openAiApiKey: true },
    });

    return {
      hasAnthropicKey: Boolean(org?.anthropicApiKey),
      hasOpenAiKey: Boolean(org?.openAiApiKey),
    };
  }),
  getAiAvailability: orgProcedure.query(async ({ ctx }) => {
    if (!ctx.org) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No organization found" });
    }
    // In self-hosted, keys come from env vars — always available
    if (!isCloud()) {
      return { keysConfigured: true };
    }

    const org = await ctx.db.organization.findUnique({
      where: { id: ctx.org.id },
      // Only Anthropic key drives the chat route — OpenAI is currently inert
      select: { anthropicApiKey: true },
    });

    return { keysConfigured: Boolean(org?.anthropicApiKey) };
  }),
  saveAiKeys: orgAdminActiveProcedure
    .use(rateLimitMiddleware("organization-ai-keys"))
    .input(
      z.object({
        anthropicApiKey: z.string().max(2048).optional(),
        openAiApiKey: z.string().max(2048).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No organization found",
        });
      }
      if (!isCloud()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "AI key configuration is only available in cloud deployments",
        });
      }

      const data: {
        anthropicApiKey?: string;
        openAiApiKey?: string;
      } = {};

      const anthropic = input.anthropicApiKey?.trim();
      if (anthropic) {
        data.anthropicApiKey = encrypt(anthropic);
      }

      const openAi = input.openAiApiKey?.trim();
      if (openAi) {
        data.openAiApiKey = encrypt(openAi);
      }

      if (Object.keys(data).length === 0) {
        return { updated: false as const };
      }

      await ctx.db.organization.update({
        where: { id: ctx.org.id },
        data,
      });

      return { updated: true as const };
    }),
  removeAiKeys: orgAdminProcedure
    .use(rateLimitMiddleware("organization-ai-keys"))
    .input(
      z.object({
        anthropic: z.boolean().optional(),
        openAi: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.org) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No organization found" });
      }
      if (!isCloud()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "AI key configuration is only available in cloud deployments",
        });
      }

      const data: { anthropicApiKey?: null; openAiApiKey?: null } = {};
      if (input.anthropic) data.anthropicApiKey = null;
      if (input.openAi) data.openAiApiKey = null;

      if (Object.keys(data).length === 0) {
        return { removed: false as const };
      }

      await ctx.db.organization.update({
        where: { id: ctx.org.id },
        data,
      });

      return { removed: true as const };
    }),
});
