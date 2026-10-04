import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, expect, test } from "vitest";
import app from "../app.ts";

const server = app.listen(0);
let baseUrl: string;

beforeAll(() => {
	baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
	server.close();
});

test("GET /api/version returns the minimum app version", async () => {
	process.env.MIN_APP_VERSION = "1.2.3";

	const response = await fetch(`${baseUrl}/api/version`);

	expect(response.status).toBe(200);
	expect(await response.json()).toEqual({ minAppVersion: "1.2.3" });
});

test("GET /api/version fails when MIN_APP_VERSION is missing", async () => {
	delete process.env.MIN_APP_VERSION;

	const response = await fetch(`${baseUrl}/api/version`);

	expect(response.status).toBe(500);
});
