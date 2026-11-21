import * as Notifications from "expo-notifications";
import type { Care } from "@/features/care/careTypes";

const mockPreferences = { remindersEnabled: true, reminderTime: "09:00" };
const mockPermission: { granted: boolean | null } = { granted: true };
const mockWeather: {
	alertsEnabled: boolean;
	alertTime: string;
	forecast: { fetchedAt: string; hours: object[] } | null;
} = { alertsEnabled: true, alertTime: "18:00", forecast: null };

// Two mild days from 2026-06-10, with a frost on the night of the 10th
const frostyForecast = () => ({
	fetchedAt: "2026-06-10T06:00:00.000Z",
	hours: Array.from({ length: 48 }, (_, index) => {
		const day = 10 + Math.floor(index / 24);
		const hour = String(index % 24).padStart(2, "0");
		const time = `2026-06-${day}T${hour}:00`;
		return {
			time,
			temperature: time === "2026-06-11T05:00" ? -2 : 15,
			gusts: 10,
			code: 1,
		};
	}),
});

jest.mock("expo-notifications", () => ({
	cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
	scheduleNotificationAsync: jest.fn(() => Promise.resolve("id")),
	SchedulableTriggerInputTypes: { DATE: "date" },
}));
jest.mock("@/features/plants/usePlantStore", () => ({
	usePlantStore: {
		getState: () => ({
			plants: [
				{
					id: "pilea",
					name: "Pilea",
					watering: 2,
					temperature: 2,
					outdoor: true,
					archivedAt: null,
				},
			],
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
jest.mock("@/features/weather/useWeatherStore", () => ({
	useWeatherStore: { getState: () => mockWeather },
}));

const { enqueueReschedule, rescheduleReminders } =
	require("@/features/notifications/scheduleReminders") as typeof import("@/features/notifications/scheduleReminders");

beforeEach(() => {
	jest.clearAllMocks();
	jest.useFakeTimers({ now: new Date(2026, 5, 10, 8, 0) });
	mockPreferences.remindersEnabled = true;
	mockPermission.granted = true;
	mockWeather.alertsEnabled = true;
	mockWeather.forecast = null;
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

	it("schedules the weather alerts even with the care reminders off", async () => {
		mockPreferences.remindersEnabled = false;
		mockWeather.forecast = frostyForecast();

		await rescheduleReminders();

		expect(
			Notifications.cancelAllScheduledNotificationsAsync,
		).toHaveBeenCalledTimes(1);
		expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
		expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
			expect.objectContaining({
				content: expect.objectContaining({
					title: "Froid : -2 °C demain vers 5 h",
				}),
				trigger: expect.objectContaining({
					date: new Date(2026, 5, 10, 18, 0),
				}),
			}),
		);
	});

	it("leaves the weather alerts out when they are turned off", async () => {
		mockWeather.alertsEnabled = false;
		mockWeather.forecast = frostyForecast();

		await rescheduleReminders();

		expect(
			Notifications.cancelAllScheduledNotificationsAsync,
		).toHaveBeenCalledTimes(1);
		expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(31);
	});

	it("never lets two reschedules overlap", async () => {
		await Promise.all([enqueueReschedule(), enqueueReschedule()]);

		const cancels = (
			Notifications.cancelAllScheduledNotificationsAsync as jest.Mock
		).mock.invocationCallOrder;
		const schedules = (Notifications.scheduleNotificationAsync as jest.Mock)
			.mock.invocationCallOrder;
		expect(cancels).toHaveLength(2);
		// Every notification of the first pass comes before the second cancel
		expect(schedules.filter((order) => order < cancels[1])).toHaveLength(31);
	});

	it("keeps the scheduled notifications while the permission is still unknown", async () => {
		mockPermission.granted = null;
		await rescheduleReminders();
		expect(
			Notifications.cancelAllScheduledNotificationsAsync,
		).not.toHaveBeenCalled();
	});
});
