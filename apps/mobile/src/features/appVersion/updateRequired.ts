import { trpc } from "@/utils/trpc";

const toNumbers = (version: string) => version.split(".").map(Number);

export function isOlderVersion(current: string, minimum: string) {
	const currentParts = toNumbers(current);
	const minimumParts = toNumbers(minimum);
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
