import type { AppRouter } from "@api/routes/index.ts";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

export const trpc = createTRPCClient<AppRouter>({
	links: [httpBatchLink({ url: `${process.env.EXPO_PUBLIC_API_URL}` })],
});
