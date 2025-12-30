import "server-only";
import { appRouter } from "./routers/_app";
import { createContext } from "./context";

const createCaller = appRouter.createCaller;

export const serverTrpc = async () => createCaller(await createContext());