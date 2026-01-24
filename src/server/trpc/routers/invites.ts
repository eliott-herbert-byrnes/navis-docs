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
          message: "No organization found",
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
          message: "Invite already pending for this email",
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

      // await createAuditLog({
      //     orgId: ctx.org.id,
      //     actorId: ctx.user?.id ?? "",
      //     // action: "INVITATION_CREATED",
      //     entityType: "INVITATION",
      //     entityId: invitation.email,
      //     afterJSON: {
      //         email: invitation.email,
      //         role: invitation.role,
      //         expiresAt: invitation.expiresAt,
      //     },
      // });

      // Generate invite link (for logging/email sending)
      const link = `${process.env.NEXTAUTH_URL}/accept-invite/${rawToken}`;
      console.log("Invite link:", link);

      return {
        data: invitation,
        message: "Invite created",
      };
    }),

  // Mutation: Delete Invitation
  deleteInvitation: adminProcedure
    .use(rateLimitMiddleware("invite-delete"))
    .input(
      z.object({
        email: z.string(),
        orgId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.invitation.findUnique({
        where: {
          invitationId: {
            orgId: input.orgId,
            email: input.email,
          },
        },
      });

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      await ctx.db.invitation.delete({
        where: {
          invitationId: { orgId: input.orgId, email: input.email },
        },
      });

      // await createAuditLog({
      //     orgId: input.orgId,
      //     actorId: ctx.user?.id ?? "",
      //     action: "INVITATION_DELETED",
      //     entityType: "INVITATION",
      //     entityId: input.email,
      //     beforeJSON: {
      //         email: invite.email,
      //         role: invite.role,
      //         status: invite.status,
      //     },
      // });

      return {
        data: invite,
        message: "Invite deleted",
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
          message: "Invite not found",
        });
      }

      if (invite.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invite already used or revoked",
        });
      }

      if (invite.expiresAt < new Date()) {
        await ctx.db.invitation.update({
          where: { invitationId: { orgId: invite.orgId, email: invite.email } },
          data: { status: "EXPIRED" },
        });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invite expired",
        });
      }

      // Check if user already belongs to an organization
      const existing = await ctx.db.orgMembership.findFirst({
        where: { userId: ctx.user?.id ?? "" },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already belongs to an organization",
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

      // await createAuditLog({
      //     orgId: invite.orgId,
      //     actorId: ctx.user?.id ?? "",
      //     action: "INVITATION_ACCEPTED",
      //     entityType: "INVITATION",
      //     entityId: invite.email,
      //     afterJSON: {
      //         email: invite.email,
      //         userId: ctx.user?.id,
      //         role: memberRole,
      //     },
      // });

      return {
        data: { orgId: invite.orgId },
        message: "Invite accepted",
      };
    }),
});
