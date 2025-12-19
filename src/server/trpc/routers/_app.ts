import { router } from "@/server/trpc/init";
import { departmentRouter } from "@/server/trpc/routers/department";

export const appRouter = router({
    department: departmentRouter,
});

export type AppRouter = typeof appRouter;