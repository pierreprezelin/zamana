import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { enqueueReschedule } from "@/features/notifications/scheduleReminders";
import { usePlantStore } from "@/features/plants/usePlantStore";
import {
	refreshForecast,
	weatherAlertsNeeded,
} from "@/features/weather/refreshForecast";
import { useWeatherStore } from "@/features/weather/useWeatherStore";
import {
	defineWeatherTask,
	startWeatherTaskSync,
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
const mockRefreshPermission = jest.fn<Promise<void>, []>(() =>
	Promise.resolve(),
);
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
	const runTask = () => {
		defineWeatherTask();
		const task = (TaskManager.defineTask as jest.Mock).mock.calls[0][1];
		return task();
	};

	it("refreshes the forecast even when it is fresh, then reschedules", async () => {
		expect(await runTask()).toBe(BackgroundTask.BackgroundTaskResult.Success);
		expect(refreshForecast).toHaveBeenCalledWith({ force: true });
		expect(enqueueReschedule).toHaveBeenCalledTimes(1);
	});

	it("waits for the notification permission before rescheduling, the app may have been woken for it alone", async () => {
		let permissionRead = () => {};
		mockRefreshPermission.mockReturnValueOnce(
			new Promise<void>((resolve) => {
				permissionRead = resolve;
			}),
		);

		const running = runTask();
		await Promise.resolve();
		expect(enqueueReschedule).not.toHaveBeenCalled();

		permissionRead();
		await running;
		expect(enqueueReschedule).toHaveBeenCalledTimes(1);
	});

	it("reports a failure to the system", async () => {
		(refreshForecast as jest.Mock).mockRejectedValueOnce(new Error("offline"));

		expect(await runTask()).toBe(BackgroundTask.BackgroundTaskResult.Failed);
	});
});

describe("startWeatherTaskSync", () => {
	it("syncs the task on launch, then when the plants or the alerts setting change", async () => {
		needed.mockReturnValue(false);
		registered.mockResolvedValue(false);

		startWeatherTaskSync();
		startWeatherTaskSync();
		const [onPlants] = (usePlantStore.subscribe as jest.Mock).mock.calls[0];
		const [onWeather] = (useWeatherStore.subscribe as jest.Mock).mock.calls[0];
		const plants: unknown[] = [];
		onPlants({ plants }, { plants });
		onWeather({ alertsEnabled: true }, { alertsEnabled: true });
		expect(registered).toHaveBeenCalledTimes(1);

		onPlants({ plants: [] }, { plants: [{}] });
		onWeather({ alertsEnabled: false }, { alertsEnabled: true });
		expect(registered).toHaveBeenCalledTimes(3);
		expect(usePlantStore.subscribe).toHaveBeenCalledTimes(1);
	});
});
