import {
  router,
  adminProcedure,
  orgAdminReadProcedure,
  orgAdminWriteProcedure,
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
  Prisma,
  type Organization,
} from "@prisma/client";
import { encrypt } from "@/lib/crypto";
import { isCloud } from "@/lib/deploy-mode";
import {
  createOrgNameSchema,
  organizationNameToSlug,
  renameOrgNameSchema,
} from "@/lib/org-name";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
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
  renameOrganization: orgAdminWriteProcedure
    .use(rateLimitMiddleware("organization-update"))
    .input(
      z.object({
        orgName: renameOrgNameSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const org = ctx.org!;
      const actorId = ctx.user!.id ?? "";

      const beforeState = {
        id: org.id,
        name: org.name,
      };

      const updatedOrg = await ctx.db.organization.update({
        where: { id: org.id },
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
        orgId: org.id,
        actorId,
        action: "ORGANIZATION_UPDATED",
        entityType: "ORGANIZATION",
        entityId: org.id,
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
        name: createOrgNameSchema,
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

      const slug = organizationNameToSlug(input.name);

      if (isCloud()) {
        if (!isStripeConfigured()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Billing is not configured. Set STRIPE_SECRET_KEY to create organizations in cloud mode.",
          });
        }
        if (!process.env.STRIPE_DEFAULT_PRICE_ID) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Billing is not configured. Set STRIPE_DEFAULT_PRICE_ID to create organizations in cloud mode.",
          });
        }
      }

      let org: Organization;
      try {
        org = await ctx.db.$transaction(async (tx) => {
          const created = await tx.organization.create({
            data: {
              name: input.name,
              slug,
              ownerUserId: userId as string,
              plan: OrgPlan.pro,
            },
          });
          await tx.orgMembership.create({
            data: {
              orgId: created.id,
              userId: userId as string,
              role: OrgMembershipRole.OWNER,
            },
          });
          return created;
        });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "Organization with this name already exists, choose a different name",
          });
        }
        throw e;
      }

      let orgForResponse = org;

      if (isCloud()) {
        const priceId = process.env.STRIPE_DEFAULT_PRICE_ID!;
        let createdCustomerId: string | undefined;
        let createdSubscriptionId: string | undefined;
        try {
            const seatCount = Math.max(
              1,
              await ctx.db.orgMembership.count({
                where: { orgId: org.id },
              }),
            );

            const customer = await getStripe().customers.create(
              {
                email: user.email ?? undefined,
                name: org.name,
                metadata: { orgId: org.id, orgSlug: org.slug },
              },
              { idempotencyKey: `org:${org.id}:customer:v1` },
            );
            createdCustomerId = customer.id;

            const subscription = await getStripe().subscriptions.create(
              {
                customer: customer.id,
                items: [{ price: priceId, quantity: seatCount }],
                trial_period_days: 14,
                payment_behavior: "default_incomplete",
                payment_settings: {
                  save_default_payment_method: "on_subscription",
                },
                metadata: { orgId: org.id, orgSlug: org.slug },
              },
              { idempotencyKey: `org:${org.id}:subscription:v1` },
            );
            createdSubscriptionId = subscription.id;

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
              const orgNameForEmail = orgForResponse.name;

              after(async () => {
                try {
                  await sendTrialStartedEmail({
                    to: ownerEmail,
                    ownerName,
                    orgName: orgNameForEmail,
                    trialEndsAt,
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
            if (createdSubscriptionId) {
              try {
                await getStripe().subscriptions.cancel(createdSubscriptionId);
              } catch (e) {
                console.error(
                  "[createOrganization] cleanup: cancel subscription failed",
                  {
                    orgId: org.id,
                    subscriptionId: createdSubscriptionId,
                    e,
                  },
                );
              }
            }
            if (createdCustomerId) {
              try {
                await getStripe().customers.del(createdCustomerId);
              } catch (e) {
                console.error(
                  "[createOrganization] cleanup: delete customer failed",
                  {
                    orgId: org.id,
                    customerId: createdCustomerId,
                    e,
                  },
                );
              }
            }
            await ctx.db.$transaction([
              ctx.db.orgMembership.deleteMany({
                where: { orgId: org.id },
              }),
              ctx.db.organization.delete({
                where: { id: org.id },
              }),
            ]);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message:
                "Failed to set up billing. Please try again or contact support.",
              cause: error,
            });
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
  getAiKeyStatus: orgAdminReadProcedure.query(async ({ ctx }) => {
    if (!ctx.org) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No organization found",
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
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No organization found",
      });
    }

    const org = await ctx.db.organization.findUnique({
      where: { id: ctx.org.id },
      // Only Anthropic key drives the chat route — OpenAI is currently inert
      select: { anthropicApiKey: true },
    });
    const hasOrgKey = Boolean(org?.anthropicApiKey);
    if (!isCloud()) {
      const hasEnvKey = Boolean(process.env.ANTHROPIC_API_KEY);
      return { keysConfigured: hasOrgKey || hasEnvKey };
    }

    return { keysConfigured: hasOrgKey };
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
  removeAiKeys: orgAdminActiveProcedure
    .use(rateLimitMiddleware("organization-ai-keys"))
    .input(
      z.object({
        anthropic: z.boolean().optional(),
        openAi: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No organization found",
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
