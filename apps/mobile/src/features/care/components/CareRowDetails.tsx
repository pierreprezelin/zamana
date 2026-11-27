import { View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import { careAppearance } from "@/features/care/careAppearance";
import type { CareType } from "@/features/care/careTypes";
import { t } from "@/utils/i18n";
import { twMerge } from "@/utils/twMerge";

export function ReminderIcon({ notified }: { notified: boolean }) {
	return (
		<Ionicons
			name={notified ? "notifications-outline" : "notifications-off-outline"}
			size={14}
			className="text-muted"
			accessibilityLabel={t(notified ? "care.reminderOn" : "care.reminderOff")}
		/>
	);
}

type CareProgressBarProps = {
	type: CareType;
	progress: number;
};

export function CareProgressBar({ type, progress }: CareProgressBarProps) {
	const appearance = careAppearance[type];
	return (
		<View
			className={twMerge(
				"mt-1 h-1 overflow-hidden rounded-xs",
				appearance.tint,
			)}
		>
			<View
				className={twMerge("h-full rounded-xs", appearance.background)}
				style={{ width: `${progress * 100}%` }}
			/>
		</View>
	);
}
