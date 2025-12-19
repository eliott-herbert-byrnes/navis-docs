import { router, adminProcedure, protectedProcedure } from "@/server/trpc/init";
import { createAuditLog } from "@/features/audit/utils/audit";
import { getStripeProvisionByOrg } from "@/features/stripe/queries/get-stripe-provisioning";
import { createLimiter, getLimitByUser } from "@/lib/rate-limiter";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const nameSchema = z.string().min(1, { message: "Is Required" }).max(28);
const optionalNameSchema = z.string().max(191);

const createDepartmentSchema = z.object({
  departmentName: nameSchema,
  teamName1: nameSchema,
  teamName2: optionalNameSchema,
  teamName3: optionalNameSchema,
});

export const departmentRouter = router({
  // List departments
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.org) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No organization found",
      });
    }

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
                  process: true,
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

  // Mutation: Create department with teams
  create: adminProcedure
    .input(createDepartmentSchema)
    .mutation(async ({ ctx, input }) => {
      // Rate limit check
      const limiter = await createLimiter();
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }
      const { success } = await getLimitByUser(
        limiter,
        ctx.user.id,
        "department-create"
      );
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests",
        });
      }

      // Department exists check
      const existingDepartment = await ctx.db.department.findFirst({
        where: {
          orgId: ctx.org!.id,
          name: input.departmentName,
        },
      });

      if (existingDepartment) {
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
        actorId: ctx.user.id ?? "",
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
      ].filter((name) => name.trim().length > 0);

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
            name: teamName,
            departmentId: department.id,
          },
        });

        await createAuditLog({
          orgId: ctx.org!.id,
          actorId: ctx.user.id ?? "",
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
});
