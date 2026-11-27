import {
	fetchDailyQuota,
	identify,
	type PlantNetError,
} from "@/features/identification/plantnet";

const API_KEY = "2b10fakefakefakefakefake";

const respond = (body: unknown, status = 200) => {
	globalThis.fetch = jest.fn(() =>
		Promise.resolve({
			ok: status >= 200 && status < 300,
			status,
			json: () => Promise.resolve(body),
		}),
	) as jest.Mock;
};

// Node's FormData turns a file into text, unlike React Native's
class FakeFormData {
	entries = new Map<string, unknown>();
	append(name: string, value: unknown) {
		this.entries.set(name, value);
	}
}
globalThis.FormData = FakeFormData as unknown as typeof FormData;

// Like expo-file-system's File: Expo's fetch reads its bytes, not a React Native { uri } part
const photo = {
	name: "shrunk.jpg",
	type: "image/jpeg",
	bytes: async () => new Uint8Array(),
} as unknown as Blob;

const fetchCall = () => (globalThis.fetch as jest.Mock).mock.calls[0];
const requestedUrl = () => new URL(fetchCall()[0] as string);

const monstera = {
	score: 0.87,
	species: {
		scientificNameWithoutAuthor: "Monstera deliciosa",
		scientificName: "Monstera deliciosa Liebm.",
		commonNames: ["Faux philodendron", "Monstera"],
	},
};
const philodendron = {
	score: 0.05,
	species: {
		scientificNameWithoutAuthor: "Philodendron bipinnatifidum",
		commonNames: [],
	},
};

const rejectionOf = (promise: Promise<unknown>) =>
	promise.then(
		() => {
			throw new Error("Expected a rejection");
		},
		(error: PlantNetError) => error.kind,
	);

describe("identify", () => {
	it("sends the photo to every flora, in the app language, for the 3 best results", async () => {
		respond({ results: [monstera], remainingIdentificationRequests: 499 });

		await identify(photo, API_KEY);

		const url = requestedUrl();
		expect(url.origin + url.pathname).toBe(
			"https://my-api.plantnet.org/v2/identify/all",
		);
		expect(url.searchParams.get("api-key")).toBe(API_KEY);
		expect(url.searchParams.get("lang")).toBe("fr");
		expect(url.searchParams.get("nb-results")).toBe("3");
		const { method, body } = fetchCall()[1] as RequestInit;
		expect(method).toBe("POST");
		const { entries } = body as unknown as FakeFormData;
		expect(entries.get("organs")).toBe("auto");
		expect(entries.get("images")).toBe(photo);
	});

	it("suggests each species by its name without author, first common name and score", async () => {
		respond({
			results: [monstera, philodendron],
			remainingIdentificationRequests: 499,
		});

		expect(await identify(photo, API_KEY)).toEqual({
			suggestions: [
				{
					scientificName: "Monstera deliciosa",
					commonName: "Faux philodendron",
					score: 0.87,
				},
				{
					scientificName: "Philodendron bipinnatifidum",
					commonName: null,
					score: 0.05,
				},
			],
			remaining: 499,
		});
	});

	it("keeps 3 suggestions at most", async () => {
		respond({ results: [monstera, monstera, monstera, monstera] });

		const { suggestions } = await identify(photo, API_KEY);

		expect(suggestions).toHaveLength(3);
	});

	it("does not know the remaining quota when Pl@ntNet does not tell it", async () => {
		respond({ results: [monstera] });

		const { remaining } = await identify(photo, API_KEY);

		expect(remaining).toBeNull();
	});

	it("rejects an answer with a malformed result", async () => {
		respond({ results: [{ ...monstera, score: 2 }] });

		expect(await rejectionOf(identify(photo, API_KEY))).toBe("unknown");
	});

	it("rejects a result without a name", async () => {
		respond({ results: [{ score: 0.5, species: {} }] });

		expect(await rejectionOf(identify(photo, API_KEY))).toBe("unknown");
	});

	it("does not recognize the plant when there is no result", async () => {
		respond({ results: [] });

		expect(await rejectionOf(identify(photo, API_KEY))).toBe("notFound");
	});

	it.each([
		[404, "notFound"],
		[401, "invalidKey"],
		[403, "invalidKey"],
		[429, "quotaExceeded"],
		[500, "unknown"],
	])("turns a %i into %s", async (status, kind) => {
		respond({}, status);

		expect(await rejectionOf(identify(photo, API_KEY))).toBe(kind);
	});

	it("is offline when the request cannot be sent", async () => {
		globalThis.fetch = jest.fn(() =>
			Promise.reject(new TypeError("Network request failed")),
		) as jest.Mock;

		expect(await rejectionOf(identify(photo, API_KEY))).toBe("offline");
	});
});

describe("fetchDailyQuota", () => {
	it("reads today's identifications", async () => {
		respond({
			day: "2026-11-27",
			quota: { identify: { count: 12, total: 500, remaining: 488 } },
		});

		expect(await fetchDailyQuota(API_KEY)).toEqual({
			day: "2026-11-27",
			count: 12,
			total: 500,
			remaining: 488,
		});
		const url = requestedUrl();
		expect(url.pathname).toBe("/v2/quota/daily");
		expect(url.searchParams.get("api-key")).toBe(API_KEY);
	});

	it("rejects a malformed answer", async () => {
		respond({ day: "2026-11-27", quota: {} });

		expect(await rejectionOf(fetchDailyQuota(API_KEY))).toBe("unknown");
	});
});
