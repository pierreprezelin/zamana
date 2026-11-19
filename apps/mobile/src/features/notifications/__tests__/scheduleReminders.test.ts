import * as Notifications from "expo-notifications";
import type { Care } from "@/features/care/careTypes";

const mockPreferences = { remindersEnabled: true, reminderTime: "09:00" };
const mockPermission = { granted: true };

jest.mock("expo-notifications", () => ({
	cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
	scheduleNotificationAsync: jest.fn(() => Promise.resolve("id")),
	SchedulableTriggerInputTypes: { DATE: "date" },
}));
jest.mock("@/features/plants/usePlantStore", () => ({
	usePlantStore: {
		getState: () => ({
			plants: [{ id: "pilea", name: "Pilea", watering: 2, archivedAt: null }],
		}),
	},
}));
jest.mock("@/features/care/useCareStore", () => ({
	useCareStore: {
		getState: () => ({
			cares: [
				{
					id: "care-1",
					plantId: "pilea",
					type: "fertilizing",
					frequency: { amount: 1, unit: "week" },
					period: null,
					lastDoneAt: "2026-06-03",
					startedAt: "2026-01-01",
					snoozedUntil: null,
					reminder: true,
				} satisfies Care,
			],
		}),
	},
}));
jest.mock("@/features/care/useCarePreferencesStore", () => ({
	useCarePreferencesStore: { getState: () => ({ climate: "north" }) },
}));
jest.mock("@/features/notifications/useNotificationPreferencesStore", () => ({
	useNotificationPreferencesStore: { getState: () => mockPreferences },
}));
jest.mock("@/features/notifications/useNotificationPermissionStore", () => ({
	useNotificationPermissionStore: { getState: () => mockPermission },
}));

const { rescheduleReminders } =
	require("@/features/notifications/scheduleReminders") as typeof import("@/features/notifications/scheduleReminders");

beforeEach(() => {
	jest.clearAllMocks();
	jest.useFakeTimers({ now: new Date(2026, 5, 10, 8, 0) });
	mockPreferences.remindersEnabled = true;
	mockPermission.granted = true;
});

afterEach(() => jest.useRealTimers());

describe("rescheduleReminders", () => {
	it("replaces the scheduled digests", async () => {
		await rescheduleReminders();
		expect(
			Notifications.cancelAllScheduledNotificationsAsync,
		).toHaveBeenCalled();
		// 30 daily digests and the pause notice
		expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(31);
		expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
			expect.objectContaining({
				content: { title: "1 soin à faire", body: "Pilea · Engrais" },
				trigger: expect.objectContaining({
					type: "date",
					date: new Date(2026, 5, 10, 9, 0),
				}),
			}),
		);
	});

	it("only cancels when the reminders are turned off", async () => {
		mockPreferences.remindersEnabled = false;
		await rescheduleReminders();
		expect(
			Notifications.cancelAllScheduledNotificationsAsync,
		).toHaveBeenCalled();
		expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
	});

	it("only cancels without the permission", async () => {
		mockPermission.granted = false;
		await rescheduleReminders();
		expect(
			Notifications.cancelAllScheduledNotificationsAsync,
		).toHaveBeenCalled();
		expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
	});
});
