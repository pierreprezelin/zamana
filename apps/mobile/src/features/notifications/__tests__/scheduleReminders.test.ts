import * as Notifications from "expo-notifications";
import { AppState, type AppStateStatus } from "react-native";
import type { Care } from "@/features/care/careTypes";
import { refreshForecast } from "@/features/weather/refreshForecast";

const mockPreferences = { remindersEnabled: true, reminderTime: "09:00" };
const mockPermission: {
	granted: boolean | null;
	refresh: () => Promise<void>;
} = { granted: true, refresh: () => Promise.resolve() };
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
	setNotificationHandler: jest.fn(),
}));
jest.mock("@/features/weather/refreshForecast", () => ({
	refreshForecast: jest.fn(),
	refreshWeather: jest.fn(() => Promise.resolve()),
}));
jest.mock("@/features/plants/usePlantStore", () => ({
	usePlantStore: {
		subscribe: jest.fn(),
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
		subscribe: jest.fn(),
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
	useCarePreferencesStore: {
		getState: () => ({ climate: "north" }),
		subscribe: jest.fn(),
	},
}));
jest.mock("@/features/notifications/useNotificationPreferencesStore", () => ({
	useNotificationPreferencesStore: {
		getState: () => mockPreferences,
		subscribe: jest.fn(),
	},
}));
jest.mock("@/features/notifications/useNotificationPermissionStore", () => ({
	useNotificationPermissionStore: {
		getState: () => mockPermission,
		subscribe: jest.fn(),
	},
}));
jest.mock("@/features/weather/useWeatherStore", () => ({
	useWeatherStore: { getState: () => mockWeather, subscribe: jest.fn() },
}));

const { usePlantStore } =
	require("@/features/plants/usePlantStore") as typeof import("@/features/plants/usePlantStore");
const { useCareStore } =
	require("@/features/care/useCareStore") as typeof import("@/features/care/useCareStore");
const { useCarePreferencesStore } =
	require("@/features/care/useCarePreferencesStore") as typeof import("@/features/care/useCarePreferencesStore");
const { useNotificationPreferencesStore } =
	require("@/features/notifications/useNotificationPreferencesStore") as typeof import("@/features/notifications/useNotificationPreferencesStore");
const { useNotificationPermissionStore } =
	require("@/features/notifications/useNotificationPermissionStore") as typeof import("@/features/notifications/useNotificationPermissionStore");
const { useWeatherStore } =
	require("@/features/weather/useWeatherStore") as typeof import("@/features/weather/useWeatherStore");
const { enqueueReschedule, rescheduleReminders, startReminderScheduler } =
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
				trigger: {
					type: "date",
					date: new Date(2026, 5, 10, 9, 0),
					// Its settings keep the plant nicknames off an Android locked screen
					channelId: "care-reminders",
				},
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
					title: "❄️ Gel",
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
		expect(schedules.filter((order) => order < (cancels[1] ?? 0))).toHaveLength(
			31,
		);
	});

	it("still reschedules after a failed pass", async () => {
		jest
			.mocked(Notifications.cancelAllScheduledNotificationsAsync)
			.mockRejectedValueOnce(new Error("busy"));

		await expect(enqueueReschedule()).rejects.toThrow("busy");
		await enqueueReschedule();

		expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(31);
	});

	it("keeps the scheduled notifications while the permission is still unknown", async () => {
		mockPermission.granted = null;
		await rescheduleReminders();
		expect(
			Notifications.cancelAllScheduledNotificationsAsync,
		).not.toHaveBeenCalled();
	});
});

describe("startReminderScheduler", () => {
	const cancels = () =>
		jest.mocked(Notifications.cancelAllScheduledNotificationsAsync).mock.calls
			.length;
	const wait = () => jest.advanceTimersByTimeAsync(2000);
	let foreground: (status: AppStateStatus) => void;
	let caresChange: () => void;
	type Listener = (state: never, previous: never) => unknown;
	// The listeners of each store, in the order the scheduler subscribes them
	const listenersOf = (store: { subscribe: unknown }) =>
		jest
			.mocked(store.subscribe as jest.Mock<unknown, [Listener]>)
			.mock.calls.map(([listener]) => listener);
	let plantsListeners: Listener[];
	let climateListener: Listener;
	let notificationPreferencesListener: Listener;
	let permissionListener: Listener;
	let weatherListeners: Listener[];

	// The scheduler starts once per app launch, so once for these tests
	const start = async () => {
		if (!foreground) {
			const listen = jest.spyOn(AppState, "addEventListener");
			startReminderScheduler();
			foreground = listen.mock.calls[0]?.[1] ?? (() => {});
			const [onCares] = jest.mocked(useCareStore.subscribe).mock.calls[0] ?? [];
			caresChange = () =>
				onCares?.({ cares: [] } as never, { cares: [] } as never);
			plantsListeners = listenersOf(usePlantStore);
			[climateListener = () => {}] = listenersOf(useCarePreferencesStore);
			[notificationPreferencesListener = () => {}] = listenersOf(
				useNotificationPreferencesStore,
			);
			[permissionListener = () => {}] = listenersOf(
				useNotificationPermissionStore,
			);
			weatherListeners = listenersOf(useWeatherStore);
		}
		await wait();
		jest.clearAllMocks();
	};

	it("reschedules once for a burst of changes, and on a new day back in the app", async () => {
		await start();

		caresChange();
		caresChange();
		caresChange();
		await wait();
		expect(cancels()).toBe(1);

		foreground("active");
		await wait();
		expect(cancels()).toBe(1);

		jest.setSystemTime(new Date(2026, 5, 11, 8, 0));
		foreground("active");
		await wait();
		expect(cancels()).toBe(2);
	});

	it("tries again back in the app after a failed pass", async () => {
		jest.spyOn(console, "warn").mockImplementation(() => {});
		await start();
		jest
			.mocked(Notifications.cancelAllScheduledNotificationsAsync)
			.mockRejectedValueOnce(new Error("busy"));

		caresChange();
		await wait();
		foreground("active");
		await wait();

		expect(cancels()).toBe(2);
		expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
	});

	it.each<[string, () => Listener | undefined, object, object]>([
		["the plants", () => plantsListeners[0], { plants: [1] }, { plants: [2] }],
		[
			"the climate",
			() => climateListener,
			{ climate: "south" },
			{ climate: "north" },
		],
		[
			"the reminders switch",
			() => notificationPreferencesListener,
			{ remindersEnabled: false, reminderTime: "09:00" },
			{ remindersEnabled: true, reminderTime: "09:00" },
		],
		[
			"the reminder time",
			() => notificationPreferencesListener,
			{ remindersEnabled: true, reminderTime: "10:00" },
			{ remindersEnabled: true, reminderTime: "09:00" },
		],
		[
			"the permission",
			() => permissionListener,
			{ granted: true },
			{ granted: null },
		],
		[
			"the forecast",
			() => weatherListeners[0],
			{ forecast: { fetchedAt: "b" }, alertsEnabled: true, alertTime: "18:00" },
			{ forecast: { fetchedAt: "a" }, alertsEnabled: true, alertTime: "18:00" },
		],
		[
			"the alerts switch",
			() => weatherListeners[0],
			{ forecast: null, alertsEnabled: false, alertTime: "18:00" },
			{ forecast: null, alertsEnabled: true, alertTime: "18:00" },
		],
		[
			"the alert time",
			() => weatherListeners[0],
			{ forecast: null, alertsEnabled: true, alertTime: "20:00" },
			{ forecast: null, alertsEnabled: true, alertTime: "18:00" },
		],
	])("reschedules when %s change", async (_, listener, state, previous) => {
		await start();

		listener()?.(state as never, previous as never);
		await wait();

		expect(cancels()).toBe(1);
	});

	it.each<[string, () => Listener | undefined, object]>([
		["the climate", () => climateListener, { climate: "north" }],
		[
			"the notification settings",
			() => notificationPreferencesListener,
			{ remindersEnabled: true, reminderTime: "09:00", bannerDismissed: true },
		],
		["the permission", () => permissionListener, { granted: true }],
	])(
		"does not reschedule when %s are unchanged",
		async (_, listener, state) => {
			await start();

			listener()?.(state as never, { ...state, canAskAgain: false } as never);
			await wait();

			expect(cancels()).toBe(0);
		},
	);

	it("only refreshes the forecast for a new place, the new forecast reschedules", async () => {
		await start();
		const weather = { forecast: null, alertsEnabled: true, alertTime: "18:00" };
		const [reschedule, refresh] = weatherListeners;

		reschedule?.(
			{ ...weather, place: "Lyon" } as never,
			{
				...weather,
				place: "Paris",
			} as never,
		);
		await wait();
		expect(cancels()).toBe(0);

		refresh?.(
			{ place: "Lyon", alertsEnabled: true } as never,
			{
				place: "Paris",
				alertsEnabled: true,
			} as never,
		);
		expect(refreshForecast).toHaveBeenCalledTimes(1);
	});
});
