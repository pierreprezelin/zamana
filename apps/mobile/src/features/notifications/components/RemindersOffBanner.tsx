import Button from "@/components/Button";
import WarningBanner from "@/components/WarningBanner";
import { useRemindersOff } from "@/features/notifications/useRemindersOff";
import { t } from "@/utils/i18n";

// Tells why the reminder toggles do nothing, with a way to turn them back on
export function RemindersOffBanner() {
	const { reason, enableTitle, enable } = useRemindersOff();
	if (!reason) return null;

	return (
		<WarningBanner
			icon="notifications-off-outline"
			message={t(`notifications.${reason}`)}
			action={
				<Button
					variant="warning"
					title={enableTitle}
					size="small"
					onPress={enable}
				/>
			}
		/>
	);
}
