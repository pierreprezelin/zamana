import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@zamana/api";
import { fetchWithTimeout } from "@/utils/getJson";

export const trpc = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${process.env.EXPO_PUBLIC_API_URL}`,
			fetch: fetchWithTimeout,
		}),
	],
});
