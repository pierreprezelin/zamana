import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { enqueueReschedule } from "@/features/notifications/scheduleReminders";
import { useNotificationPermissionStore } from "@/features/notifications/useNotificationPermissionStore";
import { usePlantStore } from "@/features/plants/usePlantStore";
import {
	refreshForecast,
	weatherAlertsNeeded,
} from "@/features/weather/refreshForecast";
import { useWeatherStore } from "@/features/weather/useWeatherStore";

const WEATHER_TASK = "weather-refresh";
// A wish: the system picks the moment, sometimes later on battery-saving phones
const MINIMUM_INTERVAL_MINUTES = 4 * 60;

// Must run when the bundle loads, also when the system wakes the app for the task alone
export const defineWeatherTask = () => {
	if (TaskManager.isTaskDefined(WEATHER_TASK)) return;
	TaskManager.defineTask(WEATHER_TASK, async () => {
		try {
			// The last known place: the location permission only covers the app in use
			await refreshForecast({ force: true });
			// Woken for the task alone, the app has not read the permission yet:
			// without it, the reschedule would cancel every notification
			await useNotificationPermissionStore.getState().refresh();
			await enqueueReschedule();
			return BackgroundTask.BackgroundTaskResult.Success;
		} catch {
			return BackgroundTask.BackgroundTaskResult.Failed;
		}
	});
};

// Without an outdoor plant needing alerts, the system has no reason to wake the app
export const syncWeatherTask = async () => {
	const registered = await TaskManager.isTaskRegisteredAsync(WEATHER_TASK);
	const needed = weatherAlertsNeeded();
	if (needed && !registered) {
		await BackgroundTask.registerTaskAsync(WEATHER_TASK, {
			minimumInterval: MINIMUM_INTERVAL_MINUTES,
		});
	} else if (!needed && registered) {
		await BackgroundTask.unregisterTaskAsync(WEATHER_TASK);
	}
};

let syncing = false;

// Follows the outdoor plants and the alerts setting
export const startWeatherTaskSync = () => {
	if (syncing) return;
	syncing = true;
	const sync = () =>
		syncWeatherTask().catch((error) =>
			console.warn("Weather task not synced", error),
		);
	usePlantStore.subscribe(
		(state, previous) => state.plants !== previous.plants && sync(),
	);
	useWeatherStore.subscribe(
		(state, previous) =>
			state.alertsEnabled !== previous.alertsEnabled && sync(),
	);
	sync();
};
