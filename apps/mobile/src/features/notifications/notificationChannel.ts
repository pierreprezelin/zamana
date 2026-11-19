import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { t } from "@/utils/i18n";

export const CHANNEL_ID = "care-reminders";

let channel: Promise<unknown> | undefined;

// Android 13 needs the channel before asking for the permission and before scheduling
export const ensureChannel = () => {
	channel ??=
		Platform.OS === "android"
			? Notifications.setNotificationChannelAsync(CHANNEL_ID, {
					name: t("notifications.channel"),
					importance: Notifications.AndroidImportance.DEFAULT,
					// Plant nicknames stay off a locked screen
					lockscreenVisibility:
						Notifications.AndroidNotificationVisibility.PRIVATE,
				}).catch(() => {
					channel = undefined;
				})
			: Promise.resolve();
	return channel;
};
