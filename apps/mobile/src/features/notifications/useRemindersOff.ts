import { useNotificationPermissionStore } from "@/features/notifications/useNotificationPermissionStore";
import { useNotificationPreferencesStore } from "@/features/notifications/useNotificationPreferencesStore";
import { t } from "@/utils/i18n";

export type RemindersOffReason = "disabledInSettings" | "notAllowed";

export const remindersOffReason = (
	enabled: boolean,
	granted: boolean | null,
): RemindersOffReason | null => {
	if (!enabled) return "disabledInSettings";
	if (granted === false) return "notAllowed";
	return null;
};

// Why no reminder will reach the user, if any, and how to turn them back on
export const useRemindersOff = () => {
	const enabled = useNotificationPreferencesStore(
		(state) => state.remindersEnabled,
	);
	const granted = useNotificationPermissionStore((state) => state.granted);
	const canAskAgain = useNotificationPermissionStore(
		(state) => state.canAskAgain,
	);
	// The system no longer asks: the button opens its settings
	const blocked = granted === false && !canAskAgain;

	return {
		reason: remindersOffReason(enabled, granted),
		enableTitle: t(
			blocked ? "notifications.openSettings" : "notifications.enable",
		),
		enable: async () => {
			useNotificationPreferencesStore.getState().setRemindersEnabled(true);
			if (!granted) await useNotificationPermissionStore.getState().request();
		},
	};
};
