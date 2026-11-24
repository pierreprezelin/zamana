import * as Notifications from "expo-notifications";
import { Linking } from "react-native";
import { create } from "zustand";
import { ensureChannel } from "@/features/notifications/notificationChannel";

type NotificationPermissionState = {
	granted: boolean | null;
	canAskAgain: boolean;
	refresh: () => Promise<void>;
	// Opens the system settings once the system no longer asks
	request: () => Promise<void>;
};

export const useNotificationPermissionStore =
	create<NotificationPermissionState>()((set, get) => {
		const apply = ({
			granted,
			canAskAgain,
		}: Notifications.NotificationPermissionsStatus) =>
			set({ granted, canAskAgain });

		return {
			granted: null,
			canAskAgain: true,
			refresh: async () => {
				try {
					apply(await Notifications.getPermissionsAsync());
				} catch (error) {
					console.warn("Notification permission not read", error);
				}
			},
			request: async () => {
				try {
					if (!get().canAskAgain) return await Linking.openSettings();
					await ensureChannel();
					apply(await Notifications.requestPermissionsAsync());
				} catch (error) {
					console.warn("Notification permission not asked", error);
				}
			},
		};
	});
