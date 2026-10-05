import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@zamana/api";

export const trpc = createTRPCClient<AppRouter>({
	links: [httpBatchLink({ url: `${process.env.EXPO_PUBLIC_API_URL}` })],
});
