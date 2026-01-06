import { router } from "@/server/trpc/init";
import { teamRouter } from "./team";
import { departmentRouter } from "./department";
import { processRouter } from "./processes";

export const appRouter = router({
  department: departmentRouter,
  team: teamRouter,
  process: processRouter,
});

export type AppRouter = typeof appRouter;
