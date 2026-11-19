import * as Notifications from "expo-notifications";
import { Linking } from "react-native";
import { useNotificationPermissionStore } from "@/features/notifications/useNotificationPermissionStore";
import { remindersOffReason } from "@/features/notifications/useRemindersOff";

jest.mock("expo-notifications", () => ({
	requestPermissionsAsync: jest.fn(() =>
		Promise.resolve({ granted: false, canAskAgain: false }),
	),
	getPermissionsAsync: jest.fn(),
}));
jest.mock("@/features/notifications/notificationChannel", () => ({
	ensureChannel: () => Promise.resolve(),
}));

beforeEach(() => {
	jest.clearAllMocks();
	jest.spyOn(Linking, "openSettings").mockResolvedValue();
	useNotificationPermissionStore.setState({ granted: null, canAskAgain: true });
});

describe("useNotificationPermissionStore", () => {
	it("asks the system and keeps its answer", async () => {
		await useNotificationPermissionStore.getState().request();
		expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
		expect(useNotificationPermissionStore.getState()).toMatchObject({
			granted: false,
			canAskAgain: false,
		});
	});

	it("opens the system settings once the system no longer asks", async () => {
		useNotificationPermissionStore.setState({
			granted: false,
			canAskAgain: false,
		});
		await useNotificationPermissionStore.getState().request();
		expect(Linking.openSettings).toHaveBeenCalled();
		expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
	});
});

describe("remindersOffReason", () => {
	it("tells why no reminder will be sent", () => {
		expect(remindersOffReason(false, true)).toBe("disabledInSettings");
		expect(remindersOffReason(true, false)).toBe("notAllowed");
		expect(remindersOffReason(true, null)).toBeNull();
		expect(remindersOffReason(true, true)).toBeNull();
	});
});
