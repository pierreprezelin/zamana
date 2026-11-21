import * as Notifications from "expo-notifications";
import { AppState } from "react-native";
import { useCarePreferencesStore } from "@/features/care/useCarePreferencesStore";
import { useCareStore } from "@/features/care/useCareStore";
import { dailyDigests } from "@/features/notifications/dailyDigests";
import {
	CHANNEL_ID,
	ensureChannel,
} from "@/features/notifications/notificationChannel";
import { useNotificationPermissionStore } from "@/features/notifications/useNotificationPermissionStore";
import { useNotificationPreferencesStore } from "@/features/notifications/useNotificationPreferencesStore";
import { usePlantStore } from "@/features/plants/usePlantStore";
import {
	refreshForecast,
	refreshWeather,
} from "@/features/weather/refreshForecast";
import { useWeatherStore } from "@/features/weather/useWeatherStore";
import { weatherNotifications } from "@/features/weather/weatherNotifications";
import { toISODate } from "@/utils/dates";

// Groups the changes of a burst of actions, like several swipes on Today
const RESCHEDULE_DELAY_MS = 500;

// Cancels everything, so the care reminders and the weather alerts are scheduled together
export const rescheduleReminders = async () => {
	const { granted } = useNotificationPermissionStore.getState();
	// Not read yet: cancelling now would wipe notifications that are still right
	if (granted === null) return;
	await Notifications.cancelAllScheduledNotificationsAsync();
	if (!granted) return;
	const { remindersEnabled, reminderTime } =
		useNotificationPreferencesStore.getState();
	const { alertsEnabled, alertTime, forecast } = useWeatherStore.getState();
	const plants = usePlantStore.getState().plants;
	const now = new Date();
	const notifications = [
		...(remindersEnabled
			? dailyDigests({
					plants,
					cares: useCareStore.getState().cares,
					climate: useCarePreferencesStore.getState().climate,
					now,
					reminderTime,
				})
			: []),
		...(alertsEnabled
			? weatherNotifications({ forecast, plants, now, alertTime })
			: []),
	];
	if (!notifications.length) return;
	await ensureChannel();
	await Promise.all(
		notifications.map(({ date, title, body }) =>
			Notifications.scheduleNotificationAsync({
				content: { title, body },
				trigger: {
					type: Notifications.SchedulableTriggerInputTypes.DATE,
					date,
					channelId: CHANNEL_ID,
				},
			}),
		),
	);
};

// Chained, so a cancel never runs in the middle of a schedule, the background task's included
let queue = Promise.resolve();
export const enqueueReschedule = () => {
	const next = queue.then(rescheduleReminders);
	// A failed pass must not block the next ones
	queue = next.catch(() => undefined);
	return next;
};

let started = false;

// Keeps the digests in step with the cares, the settings and the date
export const startReminderScheduler = () => {
	if (started) return;
	started = true;
	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldShowBanner: true,
			shouldShowList: true,
			shouldPlaySound: true,
			shouldSetBadge: false,
		}),
	});

	let timer: ReturnType<typeof setTimeout> | undefined;
	let scheduledOn: string | undefined;
	const schedule = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			scheduledOn = toISODate(new Date());
			enqueueReschedule().catch((error) => {
				// Retried on the next change or the next day
				scheduledOn = undefined;
				console.warn("Reminders not scheduled", error);
			});
		}, RESCHEDULE_DELAY_MS);
	};

	usePlantStore.subscribe(
		(state, previous) => state.plants !== previous.plants && schedule(),
	);
	useCareStore.subscribe(
		(state, previous) => state.cares !== previous.cares && schedule(),
	);
	useCarePreferencesStore.subscribe(
		(state, previous) => state.climate !== previous.climate && schedule(),
	);
	useNotificationPreferencesStore.subscribe(
		(state, previous) =>
			(state.remindersEnabled !== previous.remindersEnabled ||
				state.reminderTime !== previous.reminderTime) &&
			schedule(),
	);
	useNotificationPermissionStore.subscribe(
		(state, previous) => state.granted !== previous.granted && schedule(),
	);
	useWeatherStore.subscribe(
		(state, previous) =>
			(state.forecast !== previous.forecast ||
				state.alertsEnabled !== previous.alertsEnabled ||
				state.alertTime !== previous.alertTime) &&
			schedule(),
	);
	// A new place, alerts turned on or a plant moved outdoors need a forecast.
	// Not the device place: reading it sets the place again, which would loop.
	// refreshForecast shares a fetch already on its way
	useWeatherStore.subscribe(
		(state, previous) =>
			(state.place !== previous.place ||
				state.alertsEnabled !== previous.alertsEnabled) &&
			refreshForecast(),
	);
	usePlantStore.subscribe(
		(state, previous) => state.plants !== previous.plants && refreshForecast(),
	);
	const refresh = () => refreshWeather().catch(() => undefined);
	// Back from the system settings, or on a new day: a permission change reschedules by itself
	AppState.addEventListener("change", (status) => {
		if (status !== "active") return;
		useNotificationPermissionStore.getState().refresh();
		refresh();
		if (scheduledOn !== toISODate(new Date())) schedule();
	});
	refresh();
	useNotificationPermissionStore.getState().refresh().finally(schedule);
};
