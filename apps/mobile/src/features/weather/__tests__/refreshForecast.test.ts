import type { Plant } from "@/features/plants/plantSchema";
import { refreshDevicePlace } from "@/features/weather/devicePlace";
import { fetchForecast } from "@/features/weather/openMeteo";
import {
	refreshForecast,
	refreshWeather,
} from "@/features/weather/refreshForecast";
import { useWeatherStore } from "@/features/weather/useWeatherStore";
import type { Forecast } from "@/features/weather/weatherTypes";

let mockPlants: Partial<Plant>[] = [];

jest.mock("@/utils/syncStorage", () => {
	const { createJSONStorage } = jest.requireActual("zustand/middleware");
	const memory = new Map<string, string>();
	return {
		syncStorage: createJSONStorage(() => ({
			getItem: (key: string) => memory.get(key) ?? null,
			setItem: (key: string, value: string) => memory.set(key, value),
			removeItem: (key: string) => memory.delete(key),
		})),
	};
});
jest.mock("@/features/plants/usePlantStore", () => ({
	usePlantStore: { getState: () => ({ plants: mockPlants }) },
}));
jest.mock("@/features/weather/openMeteo", () => ({ fetchForecast: jest.fn() }));
jest.mock("@/features/weather/devicePlace", () => ({
	refreshDevicePlace: jest.fn(() => Promise.resolve()),
}));

const lyon = { name: "Lyon, France", latitude: 45.8, longitude: 4.8 };
const fresh: Forecast = { fetchedAt: new Date().toISOString(), hours: [] };
const old: Forecast = {
	fetchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
	hours: [],
};
const mockFetch = fetchForecast as jest.Mock;

beforeEach(() => {
	jest.clearAllMocks();
	mockFetch.mockReset().mockResolvedValue(fresh);
	mockPlants = [{ id: "basil", outdoor: true, archivedAt: null }];
	useWeatherStore.setState({
		alertsEnabled: true,
		place: lyon,
		forecast: null,
		failedAt: null,
	});
});

describe("refreshForecast", () => {
	it("fetches the forecast of the place and keeps it", async () => {
		await refreshForecast();

		expect(mockFetch).toHaveBeenCalledWith(45.8, 4.8);
		expect(useWeatherStore.getState().forecast).toBe(fresh);
	});

	it.each([
		[
			"the alerts are off",
			() => useWeatherStore.setState({ alertsEnabled: false }),
		],
		["no place is known", () => useWeatherStore.setState({ place: null })],
		[
			"no plant is outdoor",
			() => {
				mockPlants = [{ id: "ficus", outdoor: false, archivedAt: null }];
			},
		],
		[
			"the outdoor plants are past",
			() => {
				mockPlants = [{ id: "olive", outdoor: true, archivedAt: "2026-11-01" }];
			},
		],
	])("sends nothing when %s", async (_, arrange) => {
		arrange();
		await refreshForecast();
		expect(mockFetch).not.toHaveBeenCalled();
	});

	it("keeps a forecast younger than an hour, unless forced", async () => {
		useWeatherStore.setState({ forecast: fresh });

		await refreshForecast();
		expect(mockFetch).not.toHaveBeenCalled();

		await refreshForecast({ force: true });
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	it("fetches again once the forecast is older than an hour", async () => {
		useWeatherStore.setState({ forecast: old });
		await refreshForecast();
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	it("keeps the last forecast and notes the failure when the service fails", async () => {
		useWeatherStore.setState({ forecast: old });
		mockFetch.mockRejectedValue(new Error("offline"));

		await refreshForecast();

		const { forecast, failedAt } = useWeatherStore.getState();
		expect(forecast).toBe(old);
		expect(Number.isNaN(Date.parse(failedAt ?? ""))).toBe(false);
	});

	it("clears the failure once a forecast comes back", async () => {
		useWeatherStore.setState({ failedAt: "2026-11-20T08:00:00.000Z" });
		await refreshForecast();
		expect(useWeatherStore.getState().failedAt).toBeNull();
	});

	it("waits a few minutes after a failure before trying again", async () => {
		useWeatherStore.setState({ failedAt: new Date().toISOString() });

		await refreshForecast();
		expect(mockFetch).not.toHaveBeenCalled();

		useWeatherStore.setState({
			failedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
		});
		await refreshForecast();
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	it("shares a fetch already on its way", async () => {
		await Promise.all([refreshForecast(), refreshForecast({ force: true })]);
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	it("drops the forecast of a place left during the fetch", async () => {
		const annecy = { name: "Annecy, France", latitude: 45.9, longitude: 6.1 };
		mockFetch.mockImplementation(async () => {
			useWeatherStore.setState({ place: annecy, forecast: null });
			return fresh;
		});

		await refreshForecast();

		expect(useWeatherStore.getState().forecast).toBeNull();
	});

	it("fetches the new place instead of sharing the fetch of the old one", async () => {
		const annecy = { name: "Annecy, France", latitude: 45.9, longitude: 6.1 };
		let resolveLyon: (forecast: Forecast) => void = () => {};
		mockFetch.mockImplementationOnce(
			() => new Promise<Forecast>((resolve) => (resolveLyon = resolve)),
		);
		const lyonFetch = refreshForecast();

		useWeatherStore.setState({ place: annecy, forecast: null });
		const annecyFetch = refreshForecast();
		resolveLyon(old);
		await Promise.all([lyonFetch, annecyFetch]);

		expect(mockFetch).toHaveBeenLastCalledWith(45.9, 6.1);
		expect(useWeatherStore.getState().forecast).toBe(fresh);
	});

	it("ignores the failure of an older fetch once a newer one succeeded", async () => {
		const annecy = { name: "Annecy, France", latitude: 45.9, longitude: 6.1 };
		let failFirstLyon: (error: Error) => void = () => {};
		mockFetch.mockImplementationOnce(
			() => new Promise<Forecast>((_, reject) => (failFirstLyon = reject)),
		);
		const firstLyonFetch = refreshForecast();

		useWeatherStore.setState({ place: annecy, forecast: null });
		await refreshForecast();
		useWeatherStore.setState({ place: lyon, forecast: null });
		await refreshForecast();
		failFirstLyon(new Error("timeout"));
		await firstLyonFetch;

		const { forecast, failedAt } = useWeatherStore.getState();
		expect(forecast).toBe(fresh);
		expect(failedAt).toBeNull();
	});
});

describe("refreshWeather", () => {
	it("reads the device place only when an outdoor plant needs alerts", async () => {
		mockPlants = [{ id: "ficus", outdoor: false, archivedAt: null }];
		await refreshWeather();
		expect(refreshDevicePlace).not.toHaveBeenCalled();

		mockPlants = [{ id: "basil", outdoor: true, archivedAt: null }];
		useWeatherStore.setState({ alertsEnabled: false });
		await refreshWeather();
		expect(refreshDevicePlace).not.toHaveBeenCalled();

		useWeatherStore.setState({ alertsEnabled: true });
		await refreshWeather();
		expect(refreshDevicePlace).toHaveBeenCalledTimes(1);
	});
});
