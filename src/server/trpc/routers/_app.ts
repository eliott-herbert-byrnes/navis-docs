import { router } from "@/server/trpc/init";
import { teamRouter } from "./team";
import { departmentRouter } from "./department";

export const appRouter = router({
  department: departmentRouter,
  team: teamRouter,
});

export type AppRouter = typeof appRouter;
