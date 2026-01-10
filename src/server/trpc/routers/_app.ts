import { router } from "@/server/trpc/init";
import { teamRouter } from "./team";
import { departmentRouter } from "./department";
import { processRouter } from "./processes";
import { favoritesRouter } from "./favorites";
import { ideasRouter } from "./ideas";
import { errorsRouter } from "./errors";

export const appRouter = router({
  department: departmentRouter,
  team: teamRouter,
  process: processRouter,
  favorites: favoritesRouter,
  ideas: ideasRouter,
  errors: errorsRouter,
});

export type AppRouter = typeof appRouter;
