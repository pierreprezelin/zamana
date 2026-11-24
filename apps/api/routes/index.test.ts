import { afterEach, expect, test, vi } from "vitest";
import { createCallerFactory } from "../config/trpc.ts";
import { readMinAppVersion } from "../controllers/version.ts";
import { appRouter } from "./index.ts";

const caller = createCallerFactory(appRouter)({});

afterEach(() => {
	vi.unstubAllEnvs();
});

test("version returns the minimum app version", async () => {
	vi.stubEnv("MIN_APP_VERSION", "1.2.3");

	expect(await caller.version()).toEqual({ minAppVersion: "1.2.3" });
});

test("version fails when MIN_APP_VERSION is missing", async () => {
	vi.stubEnv("MIN_APP_VERSION", undefined);

	await expect(caller.version()).rejects.toThrow("CONFIG_MISSING");
});

test.each(["", "abc", "1.2.x", "1.2.3.4", " 1.2.3"])(
	"refuses the minimum app version %j",
	(version) => {
		vi.stubEnv("MIN_APP_VERSION", version);

		expect(readMinAppVersion()).toBeNull();
	},
);

test.each(["1", "1.2", "1.10.0"])(
	"accepts the minimum app version %s",
	(version) => {
		vi.stubEnv("MIN_APP_VERSION", version);

		expect(readMinAppVersion()).toBe(version);
	},
);
