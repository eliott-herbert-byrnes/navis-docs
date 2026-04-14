import {
  router,
  adminProcedure,
  rateLimitMiddleware,
  protectedProcedure,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sha256 } from "@/lib/crypto";
import { randomBytes } from "crypto";
import { OrgMembershipRole } from "@prisma/client";
import { createAuditLog } from "@/features/audit/utils/audit";
import { revalidateTag } from "next/cache";
import React from "react";
import { render } from "@react-email/render";
import { getResend } from "@/lib/resend";
import { InviteEmail } from "@/emails/invite";
import { syncStripeSeats } from "@/lib/stripe/sync-seats";

export const invitesRouter = router({
  // Query: Get Invites with pagination
  getInvites: adminProcedure
    .input(
      z.object({
        orgId: z.string(),
        search: z.string().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;

      const where = {
        orgId: input.orgId,
        ...(input.search && {
          email: {
            contains: input.search,
            mode: "insensitive" as const,
          },
        }),
      };

      const [invites, total] = await Promise.all([
        ctx.db.invitation.findMany({
          where,
          select: {
            email: true,
            role: true,
            status: true,
            expiresAt: true,
            invitedByUserId: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: input.pageSize,
        }),
        ctx.db.invitation.count({ where }),
      ]);

      return {
        data: {
          invites,
          pagination: {
            total,
            page: input.page,
            pageSize: input.pageSize,
            totalPages: Math.ceil(total / input.pageSize),
          },
        },
      };
    }),

  // Mutation: Create Invitation
  createInvitation: adminProcedure
    .use(rateLimitMiddleware("invite-create"))
    .input(
      z.object({
        email: z.string().email().min(1, { message: "Is Required" }).max(191),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No organization found, reauthenticate your current session",
        });
      }

      const email = input.email.toLowerCase().trim();

      // Check for existing pending invitation
      const existingPending = await ctx.db.invitation.findFirst({
        where: {
          orgId: ctx.org.id,
          email: email,
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
      });

      if (existingPending) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Invite already pending for this email, wait for it to expire or cancel the existing invite",
        });
      }

      // Generate token
      const rawToken = randomBytes(24).toString("base64url");
      const tokenHash = sha256(rawToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const role: OrgMembershipRole = "MEMBER";

      const invitation = await ctx.db.invitation.create({
        data: {
          orgId: ctx.org.id,
          email,
          role: role,
          tokenHash,
          expiresAt,
          invitedByUserId: ctx.user?.id ?? "",
          status: "PENDING",
        },
      });

      await createAuditLog({
          orgId: ctx.org.id,
          actorId: ctx.user?.id ?? "",
          action: "INVITATION_CREATED",
          entityType: "INVITATION",
          entityId: invitation.email,
          afterJSON: {
              email: invitation.email,
              role: invitation.role,
              expiresAt: invitation.expiresAt.toISOString(),
          },
      });

      const link = `${process.env.NEXTAUTH_URL}/auth/accept-invite?token=${rawToken}`;

      const resend = getResend();
      const html = await render(
        React.createElement(InviteEmail, { orgName: ctx.org.name, inviteUrl: link }),
      );
      await resend.emails.send({
        from: "Navis Docs <no-reply@app.navisdocs.com>",
        to: email,
        subject: `You've been invited to join ${ctx.org.name}`,
        html,
      });

      return {
        data: invitation,
        message: "Invite successfully created",
      };
    }),

  // Mutation: Delete Invitation
  deleteInvitation: adminProcedure
    .use(rateLimitMiddleware("invite-delete"))
    .input(
      z.object({
        email: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.invitation.findUnique({
        where: {
          invitationId: {
            orgId: ctx.org?.id ?? "",
            email: input.email,
          },
        },
      });

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found, create a new invite or refresh the list",
        });
      }

      await ctx.db.invitation.delete({
        where: {
          invitationId: { orgId: ctx.org?.id ?? "", email: input.email },
        },
      });

      await createAuditLog({
          orgId: ctx?.org?.id ?? "",
          actorId: ctx.user?.id ?? "",
          action: "INVITATION_DELETED",
          entityType: "INVITATION",
          entityId: input.email,
          beforeJSON: {
              email: invite.email,
              role: invite.role,
              status: invite.status,
          },
      });

      return {
        data: invite,
        message: "Invite successfully deleted",
      };
    }),

  // Mutation: Accept Invitation
  acceptInvitation: protectedProcedure
    .use(rateLimitMiddleware("invite-accept"))
    .input(
      z.object({
        token: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tokenHash = sha256(input.token);

      const invite = await ctx.db.invitation.findUnique({
        where: { tokenHash },
      });

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Invite not found or invalid, use the link from your invite email",
        });
      }

      if (invite.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Invite already used or revoked, request a new invite if needed",
        });
      }

      if (invite.expiresAt < new Date()) {
        await ctx.db.invitation.update({
          where: { invitationId: { orgId: invite.orgId, email: invite.email } },
          data: { status: "EXPIRED" },
        });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invite expired, request a new invite",
        });
      }

      // Check if user already belongs to an organization
      const existing = await ctx.db.orgMembership.findFirst({
        where: { userId: ctx.user?.id ?? "" },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "User already belongs to an organization, leave the current org first or use a different account",
        });
      }

      // After finding invite, verify email matches
      if (invite.email.toLowerCase() !== ctx.user!.email?.toLowerCase()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "This invitation is for a different email address, sign in with the invited email",
        });
      }

      const roleMap: Record<string, OrgMembershipRole> = {
        owner: "OWNER",
        admin: "ADMIN",
        member: "MEMBER",
      };
      const memberRole: OrgMembershipRole =
        roleMap[(invite.role || "").toLowerCase()] ?? "MEMBER";

      // Create membership and update invitation status
      await ctx.db.$transaction([
        ctx.db.orgMembership.create({
          data: {
            orgId: invite.orgId,
            userId: ctx.user?.id ?? "",
            role: memberRole,
          },
        }),
        ctx.db.invitation.update({
          where: { invitationId: { orgId: invite.orgId, email: invite.email } },
          data: { status: "ACCEPTED", acceptedAt: new Date() },
        }),
      ]);

      try {
        await syncStripeSeats(invite.orgId);
      } catch (cause) {
        await ctx.db.$transaction([
          ctx.db.orgMembership.delete({
            where: {
              orgId_userId: {
                orgId: invite.orgId,
                userId: ctx.user?.id ?? "",
              },
            },
          }),
          ctx.db.invitation.update({
            where: {
              invitationId: { orgId: invite.orgId, email: invite.email },
            },
            data: { status: "PENDING", acceptedAt: null },
          }),
        ]);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Could not update billing for your seat count. Please try again or contact support.",
          cause,
        });
      }

      revalidateTag(`org-dashboard-${invite.orgId}`, 'max');

      await createAuditLog({
          orgId: invite.orgId,
          actorId: ctx.user?.id ?? "",
          action: "INVITATION_ACCEPTED",
          entityType: "INVITATION",
          entityId: invite.email,
          afterJSON: {
              email: invite.email,
              userId: ctx.user?.id,
              role: memberRole,
          },
      });


      return {
        data: { orgId: invite.orgId },
        message: "Invite accepted",
      };
    }),
});
