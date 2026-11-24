import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
	DEFAULT_REMINDER_TIME,
	isReminderTime,
	type ReminderTime,
} from "@/features/notifications/reminderTime";
import { mergePersisted } from "@/utils/mergePersisted";
import { syncStorage } from "@/utils/syncStorage";

type NotificationPreferences = {
	remindersEnabled: boolean;
	reminderTime: ReminderTime;
	bannerDismissed: boolean;
};

type NotificationPreferencesState = NotificationPreferences & {
	setRemindersEnabled: (remindersEnabled: boolean) => void;
	setReminderTime: (reminderTime: ReminderTime) => void;
	dismissBanner: () => void;
};

export const useNotificationPreferencesStore =
	create<NotificationPreferencesState>()(
		persist(
			(set) => ({
				remindersEnabled: true,
				reminderTime: DEFAULT_REMINDER_TIME,
				bannerDismissed: false,
				setRemindersEnabled: (remindersEnabled) => set({ remindersEnabled }),
				setReminderTime: (reminderTime) => set({ reminderTime }),
				dismissBanner: () => set({ bannerDismissed: true }),
			}),
			{
				name: "notificationPreferences",
				storage: syncStorage,
				partialize: ({ remindersEnabled, reminderTime, bannerDismissed }) => ({
					remindersEnabled,
					reminderTime,
					bannerDismissed,
				}),
				// An unreadable time would silently stop every reminder
				merge: mergePersisted<NotificationPreferencesState>({
					remindersEnabled: z.boolean(),
					reminderTime: z.custom<ReminderTime>(isReminderTime),
					bannerDismissed: z.boolean(),
				}),
			},
		),
	);
