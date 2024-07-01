import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { favoritesRouter } from "./routers/favorites";
import { ratingsRouter } from "./routers/rating";
import { loggingRouter } from "./routers/logging";
import { progressRouter } from "./routers/progress";
import { lotteryBackendRouter } from "./routers/lottery-backend";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  favorites: favoritesRouter,
  ratings: ratingsRouter,
  logging: loggingRouter,
  progress: progressRouter,
  lotteryBackend: lotteryBackendRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);