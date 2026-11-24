import { initTRPC } from "@trpc/server";

// Never sends the stack, whatever NODE_ENV the server was started with
const t = initTRPC.create({ isDev: false });

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
