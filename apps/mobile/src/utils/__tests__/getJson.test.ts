import { getJson } from "@/utils/getJson";

const respond = (ok: boolean, body: unknown = {}) => {
	globalThis.fetch = jest.fn(() =>
		Promise.resolve({ ok, status: ok ? 200 : 503, json: () => body }),
	) as jest.Mock;
};

afterEach(() => jest.useRealTimers());

describe("getJson", () => {
	it("sends the params and the headers, and reads the answer", async () => {
		respond(true, { total: 1 });

		expect(
			await getJson("https://api.example", { q: "ficus" }, { "X-Key": "1" }),
		).toEqual({ total: 1 });
		expect(globalThis.fetch).toHaveBeenCalledWith(
			"https://api.example?q=ficus",
			expect.objectContaining({ headers: { "X-Key": "1" } }),
		);
	});

	it("fails when the service does", async () => {
		respond(false);
		await expect(getJson("https://api.example")).rejects.toThrow("503");
	});

	it("gives up on a service silent for 10 seconds", async () => {
		jest.useFakeTimers();
		globalThis.fetch = jest.fn(
			(_url: string, { signal }: { signal: AbortSignal }) =>
				new Promise((_resolve, reject) =>
					signal.addEventListener("abort", () => reject(new Error("aborted"))),
				),
		) as jest.Mock;

		const answer = getJson("https://api.example");
		const silence = expect(answer).rejects.toThrow("aborted");
		jest.advanceTimersByTime(9_999);
		const [, { signal }] = jest.mocked(globalThis.fetch).mock.calls[0] as [
			string,
			{ signal: AbortSignal },
		];
		expect(signal.aborted).toBe(false);
		jest.advanceTimersByTime(1);

		await silence;
	});
});
