import { publicProcedure, router } from "../config/trpc.ts";
import { getVersion } from "../controllers/version.ts";

export const appRouter = router({
	version: publicProcedure.query(getVersion),
});

export type AppRouter = typeof appRouter;
