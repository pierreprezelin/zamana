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
			refresh: async () => apply(await Notifications.getPermissionsAsync()),
			request: async () => {
				if (!get().canAskAgain) return Linking.openSettings();
				await ensureChannel();
				apply(await Notifications.requestPermissionsAsync());
			},
		};
	});
