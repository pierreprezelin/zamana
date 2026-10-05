import { afterEach, expect, test } from "vitest";
import { createCallerFactory } from "../config/trpc.ts";
import { appRouter } from "./index.ts";

const caller = createCallerFactory(appRouter)({});

afterEach(() => {
	delete process.env.MIN_APP_VERSION;
});

test("version returns the minimum app version", async () => {
	process.env.MIN_APP_VERSION = "1.2.3";

	expect(await caller.version()).toEqual({ minAppVersion: "1.2.3" });
});

test("version fails when MIN_APP_VERSION is missing", async () => {
	await expect(caller.version()).rejects.toThrow(
		"MIN_APP_VERSION is not configured",
	);
});
