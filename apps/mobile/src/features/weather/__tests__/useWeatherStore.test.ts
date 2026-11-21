import { useWeatherStore } from "@/features/weather/useWeatherStore";
import type { Forecast } from "@/features/weather/weatherTypes";

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

const lyon = { name: "Lyon, France", latitude: 45.8, longitude: 4.8 };
const annecy = { name: "Annecy, France", latitude: 45.9, longitude: 6.1 };
const forecast: Forecast = { fetchedAt: "2026-11-20T08:00:00.000Z", hours: [] };
const failedAt = "2026-11-20T09:00:00.000Z";

beforeEach(() => {
	useWeatherStore.setState({
		source: "device",
		place: lyon,
		forecast,
		failedAt,
	});
});

describe("useWeatherStore", () => {
	it.each([
		["a city is picked", () => useWeatherStore.getState().setCity(annecy)],
		[
			"the device is chosen",
			() => useWeatherStore.getState().chooseDevice(annecy),
		],
		[
			"the device moves",
			() => useWeatherStore.getState().setDevicePlace(annecy),
		],
	])(
		"forgets the forecast and the failure of the old place when %s",
		(_, act) => {
			act();

			const state = useWeatherStore.getState();
			expect(state.place).toBe(annecy);
			expect(state.forecast).toBeNull();
			expect(state.failedAt).toBeNull();
		},
	);

	it("keeps the forecast and the failure when the device stays in place", () => {
		useWeatherStore.getState().setDevicePlace({ ...lyon });

		const state = useWeatherStore.getState();
		expect(state.forecast).toBe(forecast);
		expect(state.failedAt).toBe(failedAt);
	});
});
