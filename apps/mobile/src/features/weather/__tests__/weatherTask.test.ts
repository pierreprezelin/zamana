import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { enqueueReschedule } from "@/features/notifications/scheduleReminders";
import { weatherAlertsNeeded } from "@/features/weather/refreshForecast";
import {
	defineWeatherTask,
	syncWeatherTask,
} from "@/features/weather/weatherTask";

jest.mock("expo-background-task", () => ({
	registerTaskAsync: jest.fn(() => Promise.resolve()),
	unregisterTaskAsync: jest.fn(() => Promise.resolve()),
	BackgroundTaskResult: { Success: 1, Failed: 2 },
}));
jest.mock("expo-task-manager", () => ({
	isTaskRegisteredAsync: jest.fn(),
	isTaskDefined: jest.fn(() => false),
	defineTask: jest.fn(),
}));
jest.mock("@/features/weather/refreshForecast", () => ({
	weatherAlertsNeeded: jest.fn(),
	refreshForecast: jest.fn(),
}));
jest.mock("@/features/plants/usePlantStore", () => ({
	usePlantStore: { subscribe: jest.fn() },
}));
jest.mock("@/features/weather/useWeatherStore", () => ({
	useWeatherStore: { subscribe: jest.fn() },
}));
jest.mock("@/features/notifications/scheduleReminders", () => ({
	enqueueReschedule: jest.fn(() => Promise.resolve()),
}));
const mockRefreshPermission = jest.fn(() => Promise.resolve());
jest.mock("@/features/notifications/useNotificationPermissionStore", () => ({
	useNotificationPermissionStore: {
		getState: () => ({ refresh: mockRefreshPermission }),
	},
}));

const needed = weatherAlertsNeeded as jest.Mock;
const registered = TaskManager.isTaskRegisteredAsync as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("syncWeatherTask", () => {
	it("wakes the app in the background only when an outdoor plant needs alerts", async () => {
		needed.mockReturnValue(true);
		registered.mockResolvedValue(false);

		await syncWeatherTask();

		expect(BackgroundTask.registerTaskAsync).toHaveBeenCalledTimes(1);
	});

	it("stops waking the app once no plant needs alerts", async () => {
		needed.mockReturnValue(false);
		registered.mockResolvedValue(true);

		await syncWeatherTask();

		expect(BackgroundTask.unregisterTaskAsync).toHaveBeenCalledTimes(1);
		expect(BackgroundTask.registerTaskAsync).not.toHaveBeenCalled();
	});

	it("leaves the task as it is when it already matches", async () => {
		needed.mockReturnValue(true);
		registered.mockResolvedValue(true);

		await syncWeatherTask();

		expect(BackgroundTask.registerTaskAsync).not.toHaveBeenCalled();
		expect(BackgroundTask.unregisterTaskAsync).not.toHaveBeenCalled();
	});
});

describe("the weather task", () => {
	it("reads the notification permission before rescheduling, the app may have been woken for it alone", async () => {
		defineWeatherTask();
		const task = (TaskManager.defineTask as jest.Mock).mock.calls[0][1];

		await task();

		expect(mockRefreshPermission).toHaveBeenCalled();
		expect(mockRefreshPermission.mock.invocationCallOrder[0]).toBeLessThan(
			(enqueueReschedule as jest.Mock).mock.invocationCallOrder[0],
		);
	});
});
