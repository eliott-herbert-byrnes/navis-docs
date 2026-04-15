import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "@/server/trpc/context";
import z, { ZodError } from "zod";
import {
  createLimiter,
  createProcedureImportLimiter,
  getLimitByUser,
} from "@/lib/rate-limiter";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError
          ? z.treeifyError(error.cause)
          : undefined,
    },
  }),
});

// MIDDLEWARE
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

const adminMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be an admin to perform this action",
    });
  }
  return next({ ctx });
});

export const rateLimitMiddleware = (purpose: string) =>
  t.middleware(async ({ ctx, next }) => {
    // Skip ratelimit in ci tests FOR NOW
    if (process.env.NODE_ENV === "test") {
      return next({ ctx });
    }
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to perform this action",
      });
    }
    const limiter = await createLimiter();
    const { success } = await getLimitByUser(limiter, ctx.user.id, purpose);

    if (!success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests",
      });
    }
    return next({ ctx });
  });

export const rateLimitProcedureMiddleware = (purpose: string) =>
  t.middleware(async ({ ctx, next }) => {
    // Skip ratelimit in ci tests FOR NOW
    if (process.env.NODE_ENV === "test") {
      return next({ ctx });
    }
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to perform this action",
      });
    }
    const limiter = await createProcedureImportLimiter();
    const { success } = await getLimitByUser(limiter, ctx.user.id, purpose);

    if (!success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests",
      });
    }
    return next({ ctx });
  });

const orgMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.org) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No organization found",
    });
  }
  return next({
    ctx: {
      ...ctx,
      org: ctx.org,
    },
  });
});

const subscriptionMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.hasActiveAccess) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "An active subscription is required to perform this action.",
    });
  }
  return next({ ctx });
});

// EXPORTS
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(authMiddleware);
export const adminProcedure = t.procedure
  .use(authMiddleware)
  .use(adminMiddleware);
export const orgProcedure = protectedProcedure.use(orgMiddleware);
export const orgAdminProcedure = adminProcedure.use(orgMiddleware);

/** Member write operations that require an active trial or subscription */
export const orgActiveProcedure = orgProcedure.use(subscriptionMiddleware);

/** Admin write operations that require an active trial or subscription */
export const orgAdminActiveProcedure =
  orgAdminProcedure.use(subscriptionMiddleware);
