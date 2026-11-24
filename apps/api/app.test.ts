import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, expect, test, vi } from "vitest";
import app from "./app.ts";

let server: Server;
let baseUrl: string;

beforeAll(() => {
	server = app.listen(0);
	baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
	server.close();
	vi.unstubAllEnvs();
});

test("an unknown route answers a code, not a sentence", async () => {
	const response = await fetch(`${baseUrl}/nowhere`);

	expect(response.status).toBe(404);
	expect(await response.json()).toEqual({ code: "NOT_FOUND" });
});

test("a malformed body answers a JSON code, not an HTML page", async () => {
	const response = await fetch(`${baseUrl}/v1/version`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: "{oops",
	});

	expect(response.status).toBe(400);
	expect(await response.json()).toEqual({ code: "BAD_REQUEST" });
});

test("browsers on other sites are not allowed to call it", async () => {
	const response = await fetch(`${baseUrl}/nowhere`, {
		headers: { Origin: "https://evil.example" },
	});

	expect(response.headers.get("access-control-allow-origin")).toBeNull();
});

test("an error never shows the server stack, even outside production", async () => {
	vi.stubEnv("NODE_ENV", "development");
	vi.stubEnv("MIN_APP_VERSION", undefined);

	const response = await fetch(`${baseUrl}/v1/version`);
	const body = JSON.stringify(await response.json());

	expect(response.status).toBe(500);
	expect(body).not.toContain("stack");
	expect(body).toContain("CONFIG_MISSING");
});
