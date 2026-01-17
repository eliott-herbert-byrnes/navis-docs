import { router } from "@/server/trpc/init";
import { teamRouter } from "./team";
import { departmentRouter } from "./department";
import { processRouter } from "./processes";
import { favoritesRouter } from "./favorites";
import { ideasRouter } from "./ideas";
import { errorsRouter } from "./errors";
import { usersRouter } from "./users";
import { organizationRouter } from "./organization";
import { addressRouter } from "./address";

export const appRouter = router({
  department: departmentRouter,
  team: teamRouter,
  process: processRouter,
  favorites: favoritesRouter,
  ideas: ideasRouter,
  errors: errorsRouter,
  users: usersRouter,
  organization: organizationRouter,
  address: addressRouter,
});

export type AppRouter = typeof appRouter;
