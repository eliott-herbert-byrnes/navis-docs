import { createAuditLog } from "@/features/audit/utils/audit";
import { getStripeProvisionByOrg } from "@/features/stripe/queries/get-stripe-provisioning";
import {
  router,
  adminProcedure,
  rateLimitMiddleware,
  orgProcedure,
} from "@/server/trpc/init";
import { departmentExistCheck } from "@/server/utils/department-exists-check";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const nameSchema = z.string().min(1, { message: "Is Required" }).max(28);
const optionalNameSchema = z.string().max(191).optional();

export const departmentRouter = router({
  // Query: List departments
  list: orgProcedure.query(async ({ ctx }) => {
    const [departments, count] = await ctx.db.$transaction([
      ctx.db.department.findMany({
        where: {
          orgId: ctx.org.id,
        },
        select: {
          id: true,
          name: true,
          teams: {
            select: {
              id: true,
              name: true,
              _count: {
                select: {
                  procedure: true,
                },
              },
            },
          },
        },
      }),
      ctx.db.department.count({
        where: {
          orgId: ctx.org.id,
        },
      }),
    ]);
    return { list: departments, metadata: { count } };
  }),

  // Mutation: Create department
  create: adminProcedure
    .use(rateLimitMiddleware("department-create"))
    .input(
      z.object({
        departmentName: nameSchema,
        teamName1: nameSchema,
        teamName2: optionalNameSchema,
        teamName3: optionalNameSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Department exists check
      const existingDepartment = await ctx.db.department.count({
        where: {
          orgId: ctx.org!.id,
          name: input.departmentName,
        },
      });

      if (existingDepartment > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Department already exists",
        });
      }
      // Get Stripe provisioning
      const {
        allowedDepartments,
        currentDepartments,
        allowedTeamsPerDepartment,
      } = await getStripeProvisionByOrg(ctx.org!.slug);

      if (currentDepartments >= allowedDepartments) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You have reached the maximum number of departments",
        });
      }

      // Create department
      const department = await ctx.db.department.create({
        data: {
          orgId: ctx.org!.id,
          name: input.departmentName,
        },
      });

      await createAuditLog({
        orgId: ctx.org!.id,
        actorId: ctx.user?.id ?? "",
        action: "DEPARTMENT_CREATED",
        entityType: "DEPARTMENT",
        entityId: department.id,
        afterJSON: {
          id: department.id,
          name: department.name,
        },
      });

      // Create teams
      const teamNames = [
        input.teamName1,
        input.teamName2,
        input.teamName3,
      ].filter((name) => name && name.trim().length > 0);

      if (teamNames.length > allowedTeamsPerDepartment) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You have reached the maximum number of teams per department",
        });
      }

      const createdTeams = [];
      for (const teamName of teamNames) {
        const team = await ctx.db.team.create({
          data: {
            name: teamName as string,
            departmentId: department.id,
          },
        });

        await createAuditLog({
          orgId: ctx.org!.id,
          actorId: ctx.user?.id ?? "",
          action: "TEAM_CREATED",
          entityType: "TEAM",
          entityId: team.id,
          afterJSON: {
            id: team.id,
            name: team.name,
            departmentId: department.id,
          },
        });
        createdTeams.push(team);
      }

      return {
        department,
        teams: createdTeams,
      };
    }),

  // Mutation: Delete department
  delete: adminProcedure
    .use(rateLimitMiddleware("department-delete"))
    .input(
      z.object({
        departmentId: z.string().min(1, { message: "Invalid department" }),
        departmentName: z.string().min(1, { message: "Invalid department" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Department exists check
      await departmentExistCheck(ctx, input.departmentId);

      // Before state (audit)
      const beforeState = {
        id: input.departmentId,
        name: input.departmentName,
      };

      // Delete department
      const deleted = await ctx.db.department.delete({
        where: {
          id: input.departmentId,
        },
      });

      // Audit log
      await createAuditLog({
        orgId: ctx.org!.id,
        actorId: ctx.user?.id ?? "",
        action: "DEPARTMENT_DELETED",
        entityType: "DEPARTMENT",
        entityId: input.departmentId,
        beforeJSON: beforeState,
        afterJSON: {
          id: deleted.id,
          name: deleted.name,
        },
      });

      return {
        department: deleted,
      };
    }),

  // Mutation: Rename department
  rename: adminProcedure
    .use(rateLimitMiddleware("department-rename"))
    .input(
      z.object({
        departmentId: z.string().min(1, { message: "Invalid department" }),
        oldDepartmentName: nameSchema,
        newDepartmentName: nameSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Department exists check
      await departmentExistCheck(ctx, input.departmentId);

      // Before state (audit)
      const beforeState = {
        id: input.departmentId,
        name: input.oldDepartmentName,
      };

      // Update department
      const updatedDepartment = await ctx.db.department.update({
        where: {
          id: input.departmentId,
        },
        data: {
          name: input.newDepartmentName,
        },
      });

      // Audit log
      await createAuditLog({
        orgId: ctx.org!.id,
        actorId: ctx.user?.id ?? "",
        action: "DEPARTMENT_RENAMED",
        entityType: "DEPARTMENT",
        entityId: input.departmentId,
        beforeJSON: beforeState,
        afterJSON: {
          id: updatedDepartment.id,
          name: updatedDepartment.name,
        },
      });

      return {
        department: updatedDepartment,
      };
    }),
});
