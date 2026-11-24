import {
	fetchForecast,
	roundCoordinate,
	searchCities,
} from "@/features/weather/openMeteo";

const respond = (body: unknown, ok = true) => {
	globalThis.fetch = jest.fn(() =>
		Promise.resolve({ ok, json: () => Promise.resolve(body) }),
	) as jest.Mock;
};

const requestedUrl = () =>
	(globalThis.fetch as jest.Mock).mock.calls[0][0] as string;

describe("roundCoordinate", () => {
	it("keeps one decimal, about 10 km", () => {
		expect(roundCoordinate(45.7642)).toBeCloseTo(45.8);
		expect(roundCoordinate(-0.04)).toBeCloseTo(0);
	});
});

describe("fetchForecast", () => {
	it("asks for the hourly variables at a rounded position, in local time", async () => {
		respond({
			hourly: {
				time: [],
				temperature_2m: [],
				wind_gusts_10m: [],
				weather_code: [],
			},
		});

		await fetchForecast(45.7642, 4.8357);

		const url = requestedUrl();
		expect(url).toContain("latitude=45.8");
		expect(url).toContain("longitude=4.8");
		expect(url).toContain(
			`timezone=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)}`,
		);
		expect(url).toContain(
			`hourly=${encodeURIComponent("temperature_2m,wind_gusts_10m,weather_code")}`,
		);
	});

	it("pairs each hour with its values and drops the incomplete ones", async () => {
		respond({
			hourly: {
				time: ["2026-11-20T05:00", "2026-11-20T06:00"],
				temperature_2m: [-2.4, null],
				wind_gusts_10m: [30, 40],
				weather_code: [3, 95],
			},
		});

		const forecast = await fetchForecast(45.8, 4.8);

		expect(forecast.hours).toEqual([
			{ time: "2026-11-20T05:00", temperature: -2.4, gusts: 30, code: 3 },
		]);
		expect(Number.isNaN(Date.parse(forecast.fetchedAt))).toBe(false);
	});

	it("fails when the service does", async () => {
		respond({}, false);
		await expect(fetchForecast(45.8, 4.8)).rejects.toThrow();
	});
});

describe("searchCities", () => {
	it("names each place with its region and country", async () => {
		respond({
			results: [
				{
					name: "Lyon",
					admin1: "Auvergne-Rhône-Alpes",
					country: "France",
					latitude: 45.75,
					longitude: 4.85,
				},
				{
					name: "Lyons",
					country: "États-Unis",
					latitude: 43.06,
					longitude: -76.99,
				},
			],
		});

		await expect(searchCities("lyo")).resolves.toEqual([
			{
				name: "Lyon, Auvergne-Rhône-Alpes, France",
				latitude: 45.75,
				longitude: 4.85,
			},
			{ name: "Lyons, États-Unis", latitude: 43.06, longitude: -76.99 },
		]);
		expect(requestedUrl()).toContain("name=lyo");
		expect(requestedUrl()).toContain("language=fr");
		expect(requestedUrl()).toContain("count=5");
	});

	it("skips the places the service describes badly", async () => {
		respond({
			results: [
				{ name: "Nowhere", latitude: "45", longitude: 4.85 },
				{ name: "Lyon", country: "France", latitude: 45.75, longitude: 4.85 },
			],
		});
		await expect(searchCities("lyo")).resolves.toEqual([
			{ name: "Lyon, France", latitude: 45.75, longitude: 4.85 },
		]);
	});

	it("finds nothing when the service has no result", async () => {
		respond({});
		await expect(searchCities("zzz")).resolves.toEqual([]);
	});
});
