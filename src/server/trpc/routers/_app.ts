import { router } from "@/server/trpc/init";
import { teamRouter } from "./team";
import { departmentRouter } from "./department";
import { procedureRouter } from "./procedures";
import { categoriesRouter } from "./categories";
import { favoritesRouter } from "./favorites";
import { ideasRouter } from "./ideas";
import { errorsRouter } from "./errors";
import { usersRouter } from "./users";
import { organizationRouter } from "./organization";
import { addressRouter } from "./address";
import { newsRouter } from "./news";
import { invitesRouter } from "./invites";
import { aiRouter } from "./ai";
import { ingestionRouter } from "./inngestion";

export const appRouter = router({
  department: departmentRouter,
  team: teamRouter,
  procedures: procedureRouter,
  categories: categoriesRouter,
  favorites: favoritesRouter,
  ideas: ideasRouter,
  errors: errorsRouter,
  users: usersRouter,
  organization: organizationRouter,
  address: addressRouter,
  news: newsRouter,
  invites: invitesRouter,
  ai: aiRouter,
  ingestion: ingestionRouter,
});

export type AppRouter = typeof appRouter;
