import * as Location from "expo-location";
import {
	refreshDevicePlace,
	switchToDevicePlace,
} from "@/features/weather/devicePlace";
import { useLocationPermissionStore } from "@/features/weather/useLocationPermissionStore";
import { useWeatherStore } from "@/features/weather/useWeatherStore";

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
jest.mock("expo-location", () => ({
	getForegroundPermissionsAsync: jest.fn(),
	requestForegroundPermissionsAsync: jest.fn(),
	getLastKnownPositionAsync: jest.fn(),
	getCurrentPositionAsync: jest.fn(),
	reverseGeocodeAsync: jest.fn(),
	Accuracy: { Low: 2 },
}));

const mocked = Location as jest.Mocked<typeof Location>;
const lyon = { coords: { latitude: 45.7642, longitude: 4.8357 } };

beforeEach(() => {
	jest.clearAllMocks();
	mocked.getForegroundPermissionsAsync.mockResolvedValue({
		status: "granted",
		canAskAgain: true,
	} as Location.LocationPermissionResponse);
	mocked.getLastKnownPositionAsync.mockResolvedValue(
		lyon as Location.LocationObject,
	);
	mocked.reverseGeocodeAsync.mockResolvedValue([
		{ city: "Lyon", country: "France" } as Location.LocationGeocodedAddress,
	]);
	useWeatherStore.setState({ source: "device", place: null });
});

describe("refreshDevicePlace", () => {
	it("keeps a rounded position and the name of the town", async () => {
		await refreshDevicePlace();

		expect(useWeatherStore.getState().place).toEqual({
			name: "Lyon, France",
			latitude: 45.8,
			longitude: 4.8,
		});
		expect(useLocationPermissionStore.getState().status).toBe("granted");
	});

	it("names the place by its position when the town is unknown", async () => {
		mocked.reverseGeocodeAsync.mockResolvedValue([]);
		await refreshDevicePlace();
		expect(useWeatherStore.getState().place?.name).toBe("45.8, 4.8");
	});

	it("reads the current position when none is known yet", async () => {
		mocked.getLastKnownPositionAsync.mockResolvedValue(null);
		mocked.getCurrentPositionAsync.mockResolvedValue(
			lyon as Location.LocationObject,
		);
		await refreshDevicePlace();
		expect(useWeatherStore.getState().place?.latitude).toBe(45.8);
	});

	it("leaves the place alone without the permission", async () => {
		mocked.getForegroundPermissionsAsync.mockResolvedValue({
			status: "denied",
			canAskAgain: false,
		} as Location.LocationPermissionResponse);

		await refreshDevicePlace();

		expect(mocked.getLastKnownPositionAsync).not.toHaveBeenCalled();
		expect(useWeatherStore.getState().place).toBeNull();
	});

	it("never reads the position when a town was chosen", async () => {
		const annecy = { name: "Annecy, France", latitude: 45.9, longitude: 6.1 };
		useWeatherStore.setState({ source: "city", place: annecy });

		await refreshDevicePlace();

		expect(mocked.getLastKnownPositionAsync).not.toHaveBeenCalled();
		expect(useWeatherStore.getState().place).toBe(annecy);
	});

	it("keeps the place as is while the rounded position does not change", async () => {
		const lyon = { name: "Lyon, France", latitude: 45.8, longitude: 4.8 };
		useWeatherStore.setState({ place: lyon });

		await refreshDevicePlace();

		expect(mocked.reverseGeocodeAsync).not.toHaveBeenCalled();
		expect(useWeatherStore.getState().place).toBe(lyon);
	});
});

describe("switchToDevicePlace", () => {
	const annecy = { name: "Annecy, France", latitude: 45.9, longitude: 6.1 };

	it("follows the device once its position is read", async () => {
		useWeatherStore.setState({ source: "city", place: annecy });

		await switchToDevicePlace();

		expect(useWeatherStore.getState()).toMatchObject({
			source: "device",
			place: { name: "Lyon, France", latitude: 45.8, longitude: 4.8 },
		});
	});

	it("names the place by its position when the town cannot be looked up", async () => {
		useWeatherStore.setState({ source: "city", place: annecy });
		mocked.reverseGeocodeAsync.mockRejectedValue(new Error("offline"));

		await switchToDevicePlace();

		expect(useWeatherStore.getState()).toMatchObject({
			source: "device",
			place: { name: "45.8, 4.8", latitude: 45.8, longitude: 4.8 },
		});
	});

	it("keeps the chosen city when no position can be read", async () => {
		useWeatherStore.setState({ source: "city", place: annecy });
		mocked.getLastKnownPositionAsync.mockResolvedValue(null);
		mocked.getCurrentPositionAsync.mockRejectedValue(new Error("No fix"));

		expect(await switchToDevicePlace()).toBe(false);

		expect(useWeatherStore.getState()).toMatchObject({
			source: "city",
			place: annecy,
		});
	});

	it("tells the position was found", async () => {
		expect(await switchToDevicePlace()).toBe(true);
	});

	it("gives up on a position that never comes", async () => {
		jest.useFakeTimers();
		useWeatherStore.setState({ source: "city", place: annecy });
		mocked.getLastKnownPositionAsync.mockResolvedValue(null);
		mocked.getCurrentPositionAsync.mockReturnValue(new Promise(() => {}));

		const switching = switchToDevicePlace();
		await jest.advanceTimersByTimeAsync(10_000);

		expect(await switching).toBe(false);
		expect(useWeatherStore.getState().source).toBe("city");
		jest.useRealTimers();
	});
});
