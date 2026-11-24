import { View } from "react-native";
import Button from "@/components/Button";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { formatReminderTime } from "@/features/notifications/reminderTime";
import { useNotificationPreferencesStore } from "@/features/notifications/useNotificationPreferencesStore";
import { useRemindersOff } from "@/features/notifications/useRemindersOff";
import { t } from "@/utils/i18n";

// Offers the reminders to whoever skipped or refused them, until dismissed
export function RemindersBanner() {
	const reminderTime = useNotificationPreferencesStore(
		(state) => state.reminderTime,
	);
	const bannerDismissed = useNotificationPreferencesStore(
		(state) => state.bannerDismissed,
	);
	const { reason, enableTitle, enable } = useRemindersOff();

	// Turned off in the settings on purpose: nothing to offer
	if (reason !== "notAllowed" || bannerDismissed) return null;

	return (
		<View className="gap-3 rounded-2xl border border-line bg-surface p-4">
			<View className="flex-row items-start gap-3">
				<View className="size-9 items-center justify-center rounded-xl bg-primary-tint">
					<Ionicons
						name="notifications-outline"
						size={18}
						className="text-primary"
					/>
				</View>
				<View className="flex-1">
					<Text className="font-outfit-semibold text-foreground">
						{t("notifications.banner.title")}
					</Text>
					<Text className="text-xs text-muted">
						{t("notifications.banner.description", {
							time: formatReminderTime(reminderTime),
						})}
					</Text>
				</View>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={t("notifications.banner.dismiss")}
					pressedOpacity={0.5}
					hitSlop={12}
					onPress={useNotificationPreferencesStore.getState().dismissBanner}
				>
					<Ionicons name="close" size={20} className="text-muted" />
				</Pressable>
			</View>
			<Button title={enableTitle} size="small" onPress={enable} />
		</View>
	);
}
