import { trpc } from "@/utils/trpc";

// Like 1, 1.2 or 1.2.3, a pre-release suffix compared by its number alone
const VERSION_FORMAT = /^\d+(\.\d+){0,2}(-.+)?$/;

const toNumbers = (version: string) =>
	VERSION_FORMAT.test(version)
		? version.split("-")[0]?.split(".").map(Number)
		: undefined;

// An unreadable version never blocks the user
export function isOlderVersion(current: string, minimum: string) {
	const currentParts = toNumbers(current);
	const minimumParts = toNumbers(minimum);
	if (!currentParts || !minimumParts) return false;
	const length = Math.max(currentParts.length, minimumParts.length);

	for (let index = 0; index < length; index++) {
		const difference = (currentParts[index] ?? 0) - (minimumParts[index] ?? 0);
		if (difference !== 0) return difference < 0;
	}
	return false;
}

// The app is offline-first: any API failure must let the user in
export async function isUpdateRequired(currentVersion: string) {
	try {
		const { minAppVersion } = await trpc.version.query();
		return isOlderVersion(currentVersion, minAppVersion);
	} catch {
		return false;
	}
}
