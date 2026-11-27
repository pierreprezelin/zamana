import { View } from "react-native";
import Button from "@/components/Button";
import Text from "@/components/Text";
import { careName, careVerb, upcomingLabel } from "@/features/care/careLabels";
import type { Care } from "@/features/care/careTypes";
import { CareBadge } from "@/features/care/components/CareBadge";
import {
	CareProgressBar,
	ReminderIcon,
} from "@/features/care/components/CareRowDetails";
import { useCareActions } from "@/features/care/useCareActions";
import { useRemindersOff } from "@/features/notifications/useRemindersOff";
import type { Plant } from "@/features/plants/plantSchema";

type UpcomingCareRowProps = {
	care: Care;
	plant: Plant;
	dueDate: string | null;
	progress: number | null;
	today: string;
};

export function UpcomingCareRow({
	care,
	plant,
	dueDate,
	progress,
	today,
}: UpcomingCareRowProps) {
	const { doneEarly } = useCareActions();
	const remindersOff = useRemindersOff().reason !== null;
	const notified = care.reminder && !remindersOff;

	return (
		<View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-4">
			<CareBadge type={care.type} size={36} />
			<View className="flex-1">
				<View className="flex-row items-center gap-1.5">
					<Text
						numberOfLines={1}
						className="shrink font-outfit-semibold text-foreground"
					>
						{careName(care.type)}
					</Text>
					<ReminderIcon notified={notified} />
				</View>
				<Text className="text-xs text-muted">
					{upcomingLabel(care, dueDate, today)}
				</Text>
				{progress !== null && (
					<CareProgressBar type={care.type} progress={progress} />
				)}
			</View>
			{/* Done today from the form: once a day, nothing left to do */}
			{care.lastDoneAt !== today && (
				<Button
					variant="ghost"
					title={careVerb(care.type)}
					size="small"
					className="bg-primary-tint px-4"
					onPress={() => doneEarly(care, plant, today)}
				/>
			)}
		</View>
	);
}
