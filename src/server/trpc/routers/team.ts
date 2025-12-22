import { createAuditLog } from "@/features/audit/utils/audit";
import { adminProcedure, rateLimitMiddleware, router } from "../init";
import { TRPCError } from "@trpc/server";
import { getStripeProvisionByOrg } from "@/features/stripe/queries/get-stripe-provisioning";
import { departmentExistCheck } from "@/server/utils/department-exists-check";
import { z } from "zod";

export const teamRouter = router({
  // create team
  create: adminProcedure
    .use(rateLimitMiddleware("team-create"))
    .input(
      z.object({
        departmentId: z.string().min(1, { message: "Invalid department" }),
        teamName: z.string().min(1, { message: "Is Required" }).max(28),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Department exists check
      await departmentExistCheck(ctx, input.departmentId);

      // Team exists check
      const existingTeam = await ctx.db.team.findFirst({
        where: {
          name: input.teamName,
          departmentId: input.departmentId,
        },
      });

      if (existingTeam) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Team already exists",
        });
      }

      // Get Stripe provisioning
      const { allowedTeamsPerDepartment } = await getStripeProvisionByOrg(
        ctx.org!.slug
      );

      // Check if team count is within limit
      const teamsInDept = await ctx.db.team.count({
        where: { departmentId: input.departmentId },
      });

      if (teamsInDept >= allowedTeamsPerDepartment) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You have reached the maximum number of teams per department",
        });
      }

      // Create team
      const createdTeam = await ctx.db.team.create({
        data: {
          name: input.teamName,
          departmentId: input.departmentId,
        },
      });

      // Audit log
      await createAuditLog({
        orgId: ctx.org!.id,
        actorId: ctx.user?.id ?? "",
        action: "TEAM_CREATED",
        entityType: "TEAM",
        entityId: createdTeam.id,
        afterJSON: {
          id: createdTeam.id,
          name: createdTeam.name,
          departmentId: createdTeam.departmentId,
        },
      });

      return {
        team: createdTeam,
      };
    }),

  // delete team

  delete: adminProcedure
    .use(rateLimitMiddleware("team-delete"))
    .input(
      z.object({
        departmentId: z.string().min(1, { message: "Invalid department" }),
        teamName: z.string().min(1, { message: "Invalid team" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Department exists check
      await departmentExistCheck(ctx, input.departmentId);

      // Find team
      const team = await ctx.db.team.findFirst({
        where: {
          name: input.teamName,
          departmentId: input.departmentId,
        },
      });

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }

      // Before state (audit)
      const beforeState = {
        name: team.name,
        departmentId: team.departmentId,
      };

      // Delete team
      const deletedTeam = await ctx.db.team.delete({
        where: {
          id: team.id,
        },
      });

      // Audit log
      await createAuditLog({
        orgId: ctx.org!.id,
        actorId: ctx.user?.id ?? "",
        action: "TEAM_DELETED",
        entityType: "TEAM",
        entityId: deletedTeam.id,
        beforeJSON: beforeState,
        afterJSON: {
          id: deletedTeam.id,
          name: deletedTeam.name,
          departmentId: deletedTeam.departmentId,
        },
      });
      return {
        team: deletedTeam,
      };
    }),

  // rename team
  rename: adminProcedure
    .use(rateLimitMiddleware("team-rename"))
    .input(z.object({
        departmentId: z.string().min(1, { message: "Invalid department" }),
        oldTeamName: z.string().min(1, { message: "Invalid team" }),
        newTeamName: z.string().min(1, { message: "Is Required" }).max(28),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Department exists check
      await departmentExistCheck(ctx, input.departmentId);

      // Team check
      const team = await ctx.db.team.findFirst({
        where: {
          name: input.oldTeamName,
          departmentId: input.departmentId,
        },
      });
      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }

      // Team exists check
      const existingTeam = await ctx.db.team.findFirst({
        where: {
          name: input.newTeamName,
          departmentId: input.departmentId,
          id: { not: team.id },
        },
      });

      if (existingTeam) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Team already exists",
        });
      }

      // Before state (audit)
      const beforeState = {
        id: team.id,
        name: team.name,
      };

      // Update team
      const updatedTeam = await ctx.db.team.update({
        where: { id: team.id },
        data: { name: input.newTeamName },
      });

      // Audit log
      await createAuditLog({
        orgId: ctx.org!.id,
        actorId: ctx.user?.id ?? "",
        action: "TEAM_RENAMED",
        entityType: "TEAM",
        entityId: team.id,
        beforeJSON: beforeState,
        afterJSON: {
          id: updatedTeam.id,
          name: updatedTeam.name,
          departmentId: updatedTeam.departmentId,
        },
      });

      return {
        team: updatedTeam,
      };
    }),
});
