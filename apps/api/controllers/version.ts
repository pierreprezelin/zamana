import { TRPCError } from "@trpc/server";

const VERSION_FORMAT = /^\d+(\.\d+){0,2}$/;

// Null when missing or unreadable: the app compares it number by number
export const readMinAppVersion = () => {
	const version = process.env.MIN_APP_VERSION;
	return version && VERSION_FORMAT.test(version) ? version : null;
};

export const getVersion = () => {
	const minAppVersion = readMinAppVersion();

	if (!minAppVersion) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "CONFIG_MISSING",
		});
	}

	return { minAppVersion };
};
