import * as Location from "expo-location";
import { useLocationPermissionStore } from "@/features/weather/useLocationPermissionStore";

jest.mock("expo-location", () => ({
	getForegroundPermissionsAsync: jest.fn(),
	requestForegroundPermissionsAsync: jest.fn(),
}));

const mocked = Location as jest.Mocked<typeof Location>;

beforeEach(() => {
	useLocationPermissionStore.setState({ status: null, canAskAgain: true });
});

describe("useLocationPermissionStore", () => {
	it("keeps the known status when the system cannot ask", async () => {
		mocked.requestForegroundPermissionsAsync.mockRejectedValue(
			new Error("No activity"),
		);

		await expect(
			useLocationPermissionStore.getState().request(),
		).resolves.toBeUndefined();
		expect(useLocationPermissionStore.getState().status).toBeNull();
	});
});
