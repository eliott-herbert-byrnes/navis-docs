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
  // Query: Get org members
  getOrgMembers: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().default(10),
        offset: z.number().default(0),
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

      const userToDelete = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!userToDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const deleted = await ctx.db.user.delete({
        where: { id: input.userId },
      });

      await createAuditLog({
        orgId: ctx.org.id,
        actorId: ctx?.user?.id ?? "",
        action: "USER_DELETED",
        entityType: "USER",
        entityId: input.userId,
      });

      return {
        data: deleted,
        message: "User deleted successfully",
      };
    }),

  // Mutation: Change user role
  changeUserRole: adminProcedure
    .use(rateLimitMiddleware("user-change-role"))
    .input(
      z.object({
        userId: z.string().min(1, { message: "User ID is required" }),
        role: z.nativeEnum(OrgMembershipRole),
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
