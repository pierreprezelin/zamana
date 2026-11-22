import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FieldLabel from "@/components/FieldLabel";
import Text from "@/components/Text";
import ToggleRow from "@/components/ToggleRow";
import { RemindersOffBanner } from "@/features/notifications/components/RemindersOffBanner";
import { ReminderTimeField } from "@/features/notifications/components/ReminderTimeField";
import {
	DEFAULT_REMINDER_TIME,
	formatReminderTime,
} from "@/features/notifications/reminderTime";
import { useNotificationPreferencesStore } from "@/features/notifications/useNotificationPreferencesStore";
import { useRemindersOff } from "@/features/notifications/useRemindersOff";
import {
	DEFAULT_ALERT_TIME,
	useWeatherStore,
} from "@/features/weather/useWeatherStore";
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
	const { alertsEnabled, alertTime, setAlertsEnabled, setAlertTime } =
		useWeatherStore();

	return (
		<ScrollView
			contentContainerClassName="gap-6 p-4"
			contentContainerStyle={{ paddingBottom: bottom + 16 }}
		>
			{/* Turned off here, the toggle below already says so */}
			{reason === "notAllowed" && <RemindersOffBanner />}
			<View className="gap-4">
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
						defaultValue={DEFAULT_REMINDER_TIME}
						onChange={setReminderTime}
						disabled={!remindersEnabled}
					/>
					<Text className="mt-2 text-xs text-muted">
						{t("notifications.timeHelper")}
					</Text>
				</View>
			</View>
			<View className="gap-4">
				<View className="rounded-2xl border border-line p-4">
					<ToggleRow
						label={t("weather.settings.alerts")}
						helper={t("weather.settings.alertsHelper")}
						value={alertsEnabled}
						onChange={setAlertsEnabled}
					/>
				</View>
				<View>
					<FieldLabel>{t("weather.settings.time")}</FieldLabel>
					<ReminderTimeField
						value={alertTime}
						defaultValue={DEFAULT_ALERT_TIME}
						onChange={setAlertTime}
						disabled={!alertsEnabled}
					/>
					<Text className="mt-2 text-xs text-muted">
						{t("weather.settings.timeHelper", {
							time: formatReminderTime(alertTime),
						})}
					</Text>
				</View>
			</View>
		</ScrollView>
	);
}
