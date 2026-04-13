import {
  router,
  adminProcedure,
  rateLimitMiddleware,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createAuditLog } from "@/features/audit/utils/audit";
import { OrgMembershipRole } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { syncStripeSeats } from "@/lib/stripe/sync-seats";

export const usersRouter = router({
  // Query: Get users by IDs
  getUsersByIds: adminProcedure
    .use(rateLimitMiddleware("user-get-ids"))
    .input(
      z.object({
        userIds: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "No organization found, please reauthenticate your current session",
        });
      }

      // Only return users that belong to the caller's organization
      const users = await ctx.db.user.findMany({
        where: {
          id: {
            in: input.userIds.filter(Boolean),
          },
          memberships: {
            some: {
              orgId: ctx.org.id,
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return {
        data: users,
      };
    }),

  // Query: Get All Org Users for export
  getOrgUsersForExport: adminProcedure
    .use(rateLimitMiddleware("user-get-all-for-export"))
    .input(z.void().optional())
    .query(async ({ ctx }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "No organization found, please reauthenticate your current session",
        });
      }

      const users = await ctx.db.orgMembership.findMany({
        where: {
          orgId: ctx.org.id,
        },
        select: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          id: true,
          orgId: true,
          userId: true,
          createdAt: true,
          role: true,
        },
        orderBy: [
          {
            user: {
              name: "asc",
            },
          },
          { role: "asc" },
        ],
        take: 5000,
      });

      return users ?? [];
    }),

  // Query: Get org members
  getOrgMembers: adminProcedure
    .use(rateLimitMiddleware("user-get-members"))
    .input(
      z.object({
        search: z.string().max(100).optional(),
        limit: z.number().max(100).default(10),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.org) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "No organization found, please reauthenticate your current session",
        });
      }

      const where = {
        orgId: ctx.org.id,
        ...(input.search
          ? {
              user: {
                OR: [
                  {
                    name: {
                      contains: input.search,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    email: {
                      contains: input.search,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            }
          : {}),
      };

      const [members, total] = await Promise.all([
        ctx.db.orgMembership.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                emailVerified: true,
                memberships: {
                  select: {
                    role: true,
                  },
                },
              },
            },
          },
          orderBy: {
            user: {
              name: "asc",
            },
          },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.db.orgMembership.count({ where }),
      ]);

      return {
        members: members ?? [],
        total,
        hasMore: input.offset + input.limit < total,
        currentPage: Math.floor(input.offset / input.limit) + 1,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  // Mutation: Delete user from base
  deleteUser: adminProcedure
    .use(rateLimitMiddleware("user-base-delete"))
    .input(
      z.object({
        userId: z.string().min(1, { message: "User ID is required" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.org) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized, reauthenticate your current session",
        });
      }

      const membershipToDelete = await ctx.db.orgMembership.findUnique({
        where: {
          orgId_userId: {
            orgId: ctx.org.id,
            userId: input.userId,
          },
        },
        include: {
          user: true,
        },
      });

      if (!membershipToDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "User not found in this organization, refresh the list or select another user",
        });
      }

      if (ctx.org.ownerUserId === input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Cannot delete the organization owner, transfer ownership first",
        });
      }

      if (ctx.user.id === input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete yourself, ask another admin to remove you",
        });
      }

      if (membershipToDelete.role === "OWNER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Cannot delete organization owners, transfer ownership first",
        });
      }

      await ctx.db.orgMembership.delete({
        where: {
          orgId_userId: {
            orgId: ctx.org.id,
            userId: input.userId,
          },
        },
      });

      try {
        await syncStripeSeats(ctx.org.id);
      } catch (cause) {
        await ctx.db.orgMembership.create({
          data: {
            orgId: membershipToDelete.orgId,
            userId: membershipToDelete.userId,
            role: membershipToDelete.role,
            compliant: membershipToDelete.compliant,
          },
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Could not update billing for your seat count. Please try again or contact support.",
          cause,
        });
      }

      revalidateTag(`org-dashboard-${ctx.org.id}`, 'max');

      await createAuditLog({
        orgId: ctx.org.id,
        actorId: ctx?.user?.id ?? "",
        action: "USER_DELETED",
        entityType: "USER",
        entityId: input.userId,
        beforeJSON: {
          email: membershipToDelete.user.email,
          name: membershipToDelete.user.name,
          role: membershipToDelete.role,
        },
      });

      return {
        message: "User removed from organization successfully",
      };
    }),

  deleteUsers: adminProcedure
    .use(rateLimitMiddleware("user-base-delete"))
    .input(
      z.object({
        userIds: z.array(z.string().min(1)).min(1).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.org) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized, reauthenticate your current session",
        });
      }

      const memberships = await ctx.db.orgMembership.findMany({
        where: {
          orgId: ctx.org.id,
          userId: { in: input.userIds },
          role: { not: "OWNER" },
        },
        include: { user: true },
      });

      const toDelete = memberships.filter(
        (m) => m.userId !== ctx.user!.id && m.userId !== ctx.org!.ownerUserId,
      );

      if (toDelete.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No users can be removed (cannot remove owner or yourself)",
        });
      }

      const restoreSnapshots = toDelete.map((m) => ({
        orgId: m.orgId,
        userId: m.userId,
        role: m.role,
        compliant: m.compliant,
      }));

      for (const m of toDelete) {
        await ctx.db.orgMembership.delete({
          where: {
            orgId_userId: { orgId: ctx.org.id, userId: m.userId },
          },
        });
      }

      try {
        await syncStripeSeats(ctx.org.id);
      } catch (cause) {
        for (const s of restoreSnapshots) {
          await ctx.db.orgMembership.create({
            data: {
              orgId: s.orgId,
              userId: s.userId,
              role: s.role,
              compliant: s.compliant,
            },
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Could not update billing for your seat count. Please try again or contact support.",
          cause,
        });
      }

      revalidateTag(`org-dashboard-${ctx.org.id}`, 'max');

      for (const m of toDelete) {
        await createAuditLog({
          orgId: ctx.org.id,
          actorId: ctx.user.id ?? "",
          action: "USER_DELETED",
          entityType: "USER",
          entityId: m.userId,
          beforeJSON: {
            email: m.user.email,
            name: m.user.name,
            role: m.role,
          },
        });
      }

      return {
        data: { deletedCount: toDelete.length },
        message:
          toDelete.length === 1
            ? "User removed from organization successfully"
            : `${toDelete.length} users removed from organization successfully`,
      };
    }),

  // Mutation: Change user role
  changeUserRole: adminProcedure
    .use(rateLimitMiddleware("user-change-role"))
    .input(
      z.object({
        userId: z.string().min(1, { message: "User ID is required" }),
        role: z.enum(OrgMembershipRole),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.org) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized, reauthenticate your current session",
        });
      }

      const userToUpdate = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });
      if (!userToUpdate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found, refresh the page or select another user",
        });
      }
      const roleMap: Record<string, OrgMembershipRole> = {
        admin: "ADMIN",
        member: "MEMBER",
      };
      const newRole: OrgMembershipRole =
        roleMap[(input.role || "").toLowerCase()] ?? "MEMBER";

      if (input.role === "OWNER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Cannot promote users to owner role, owner role is managed separately",
        });
      }

      const currentMembership = await ctx.db.orgMembership.findUnique({
        where: {
          orgId_userId: {
            orgId: ctx.org.id,
            userId: input.userId,
          },
        },
      });

      if (!currentMembership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User membership not found, refresh the page or try again",
        });
      }

      if (currentMembership.role === "OWNER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Cannot change the role of an organization owner, owner role is managed separately",
        });
      }

      const updated = await ctx.db.user.update({
        where: { id: input.userId },
        data: {
          memberships: {
            update: {
              where: {
                orgId_userId: {
                  orgId: ctx.org?.id ?? "",
                  userId: input.userId,
                },
              },
              data: { role: newRole as OrgMembershipRole },
            },
          },
        },
      });

      await createAuditLog({
        orgId: ctx.org?.id ?? "",
        actorId: ctx?.user?.id ?? "",
        action: "USER_ROLE_CHANGED",
        entityType: "USER_ROLE",
        entityId: input.userId,
        beforeJSON: currentMembership.role as OrgMembershipRole,
        afterJSON: newRole as OrgMembershipRole,
      });

      return {
        data: updated,
      };
    }),
});
