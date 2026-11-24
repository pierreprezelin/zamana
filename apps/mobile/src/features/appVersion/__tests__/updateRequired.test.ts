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
		["1.2.5", "1.2", false],
		["1.0.0", "latest", false],
	])("%s older than %s: %s", (current, minimum, expected) => {
		expect(isOlderVersion(current, minimum)).toBe(expected);
	});

	it("compares the parts as numbers, not as text", () => {
		expect(isOlderVersion("1.9.0", "1.10.0")).toBe(true);
		expect(isOlderVersion("1.10.0", "1.9.0")).toBe(false);
	});

	it("treats a missing part as zero", () => {
		expect(isOlderVersion("1.2", "1.2.0")).toBe(false);
		expect(isOlderVersion("1.2.0", "1.2")).toBe(false);
	});

	it.each([
		["abc", "1.0.0"],
		["1.0.0", "abc"],
		["", "1.0.0"],
		["1.0.0", ""],
		["1..2", "1.0.0"],
	])(
		"never requires an update for the unreadable version in %s, %s",
		(current, minimum) => {
			expect(isOlderVersion(current, minimum)).toBe(false);
		},
	);

	it("compares a pre-release by its version number", () => {
		expect(isOlderVersion("1.2.3-beta", "1.2.4")).toBe(true);
		expect(isOlderVersion("1.2.3-beta", "1.2.3")).toBe(false);
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
