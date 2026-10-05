import { TRPCError } from "@trpc/server";

export const getVersion = () => {
	const minAppVersion = process.env.MIN_APP_VERSION;

	if (!minAppVersion) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "MIN_APP_VERSION is not configured",
		});
	}

	return { minAppVersion };
};
