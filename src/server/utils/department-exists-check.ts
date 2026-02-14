import { TRPCError } from "@trpc/server";
import { Context } from "../trpc/context";

async function departmentExistCheck(ctx: Context, departmentId: string) {
  const existingDepartment = await ctx.db.department.findFirst({
    where: {
      orgId: ctx.org!.id,
      id: departmentId,
    },
  });

  if (!existingDepartment) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Department not found, select a valid department",
    });
  }
}

export { departmentExistCheck };
