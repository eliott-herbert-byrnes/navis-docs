import {
  router,
  adminProcedure,
  rateLimitMiddleware,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createAuditLog } from "@/features/audit/utils/audit";
import { OrgMembershipRole } from "@prisma/client";
import { getUserOrg } from "@/lib/auth";

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
          message: "No organization found",
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
          message: "No organization found",
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
          message: "No organization found",
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
          message: "Unauthorized",
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
          message: "User not found in this organization",
        });
      }

      if (ctx.org.ownerUserId === input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete the organization owner",
        });
      }

      if (ctx.user.id === input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete yourself",
        });
      }

      if (membershipToDelete.role === "OWNER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete organization owners",
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
          message: "Unauthorized",
        });
      }

      const org = await getUserOrg(ctx?.user?.id ?? "");
      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No organization found",
        });
      }

      const userToUpdate = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });
      if (!userToUpdate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
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
          message: "Cannot promote users to owner role",
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
          message: "User membership not found",
        });
      }

      if (currentMembership.role === "OWNER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot change the role of an organization owner",
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
        beforeJSON: org.role as OrgMembershipRole,
        afterJSON: newRole as OrgMembershipRole,
      });

      return {
        data: updated,
      };
    }),
});
