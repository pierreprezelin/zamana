import {
	isOlderVersion,
	isUpdateRequired,
} from "@/features/appVersion/updateRequired";
import { trpc } from "@/utils/trpc";

jest.mock("@/utils/trpc", () => ({
	trpc: { version: { query: jest.fn() } },
}));

const versionQuery = trpc.version.query as jest.Mock;

describe("isOlderVersion", () => {
	it.each([
		["1.9.0", "1.10.0", true],
		["1.10.0", "1.9.0", false],
		["1.0.0", "1.0.0", false],
		["1.0.0", "1.0.1", true],
		["1.2.3", "2.0.0", true],
		["2.0.0", "1.99.99", false],
		["1.2", "1.2.1", true],
		["1.2.1", "1.2", false],
		["1.0.0", "latest", false],
	])("%s older than %s: %s", (current, minimum, expected) => {
		expect(isOlderVersion(current, minimum)).toBe(expected);
	});
});

describe("isUpdateRequired", () => {
	it("requires an update when the minimum version is newer", async () => {
		versionQuery.mockResolvedValue({ minAppVersion: "1.10.0" });
		await expect(isUpdateRequired("1.9.0")).resolves.toBe(true);
	});

	it("does not require an update when the app is up to date", async () => {
		versionQuery.mockResolvedValue({ minAppVersion: "1.0.0" });
		await expect(isUpdateRequired("1.0.0")).resolves.toBe(false);
	});

	it("does not block the user when the API fails", async () => {
		versionQuery.mockRejectedValue(new Error("offline"));
		await expect(isUpdateRequired("1.0.0")).resolves.toBe(false);
	});
});
