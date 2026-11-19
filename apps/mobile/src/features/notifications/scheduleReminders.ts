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
import { toISODate } from "@/utils/dates";

// Groups the changes of a burst of actions, like several swipes on Today
const RESCHEDULE_DELAY_MS = 500;

export const rescheduleReminders = async () => {
	await Notifications.cancelAllScheduledNotificationsAsync();
	const { remindersEnabled, reminderTime } =
		useNotificationPreferencesStore.getState();
	if (!remindersEnabled || !useNotificationPermissionStore.getState().granted)
		return;
	await ensureChannel();
	const digests = dailyDigests({
		plants: usePlantStore.getState().plants,
		cares: useCareStore.getState().cares,
		climate: useCarePreferencesStore.getState().climate,
		now: new Date(),
		reminderTime,
	});
	await Promise.all(
		digests.map(({ date, title, body }) =>
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
	// Chained, so a cancel never runs in the middle of a schedule
	let queue = Promise.resolve();
	const schedule = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			scheduledOn = toISODate(new Date());
			queue = queue.then(rescheduleReminders).catch((error) => {
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
	// Back from the system settings, or on a new day: a permission change reschedules by itself
	AppState.addEventListener("change", (status) => {
		if (status !== "active") return;
		useNotificationPermissionStore.getState().refresh();
		if (scheduledOn !== toISODate(new Date())) schedule();
	});
	useNotificationPermissionStore.getState().refresh().finally(schedule);
};
