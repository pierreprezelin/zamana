import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FieldLabel from "@/components/FieldLabel";
import Text from "@/components/Text";
import ToggleRow from "@/components/ToggleRow";
import { RemindersOffBanner } from "@/features/notifications/components/RemindersOffBanner";
import { ReminderTimeField } from "@/features/notifications/components/ReminderTimeField";
import { useNotificationPreferencesStore } from "@/features/notifications/useNotificationPreferencesStore";
import { useRemindersOff } from "@/features/notifications/useRemindersOff";
import { t } from "@/utils/i18n";

export default function NotificationsSettingsScreen() {
	const { bottom } = useSafeAreaInsets();
	const {
		remindersEnabled,
		reminderTime,
		setRemindersEnabled,
		setReminderTime,
	} = useNotificationPreferencesStore();
	const { reason, enable } = useRemindersOff();

	return (
		<View className="flex-1 gap-6 p-4" style={{ paddingBottom: bottom + 16 }}>
			{/* Turned off here, the toggle below already says so */}
			{reason === "notAllowed" && <RemindersOffBanner />}
			<View className="rounded-2xl border border-line p-4">
				<ToggleRow
					label={t("notifications.reminders")}
					helper={t("notifications.remindersHelper")}
					value={remindersEnabled}
					onChange={(enabled) =>
						enabled ? enable() : setRemindersEnabled(false)
					}
				/>
			</View>
			<View>
				<FieldLabel>{t("notifications.time")}</FieldLabel>
				<ReminderTimeField
					value={reminderTime}
					onChange={setReminderTime}
					disabled={!remindersEnabled}
				/>
				<Text className="mt-2 text-xs text-muted">
					{t("notifications.timeHelper")}
				</Text>
			</View>
		</View>
	);
}
