import { View } from "react-native";
import { twMerge } from "tailwind-merge";
import Button from "@/components/Button";
import { Ionicons } from "@/components/ionicons";
import Text from "@/components/Text";
import { careAppearance } from "@/features/care/careAppearance";
import {
	careName,
	careVerb,
	dueLabel,
	lastDoneLabel,
} from "@/features/care/careLabels";
import type { Care } from "@/features/care/careTypes";
import { CareBadge } from "@/features/care/components/CareBadge";
import { useCareActions } from "@/features/care/useCareActions";
import type { Plant } from "@/features/plants/plantSchema";
import { t } from "@/utils/i18n";

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
	const appearance = careAppearance[care.type];
	const { done } = useCareActions();

	return (
		<View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-3">
			<CareBadge type={care.type} size={36} />
			<View className="flex-1 gap-1">
				<View className="flex-row items-center gap-1.5">
					<Text
						numberOfLines={1}
						className="shrink font-outfit-semibold text-foreground"
					>
						{careName(care.type)}
					</Text>
					<Ionicons
						name={
							care.reminder
								? "notifications-outline"
								: "notifications-off-outline"
						}
						size={14}
						className="text-muted"
						accessibilityLabel={t(
							care.reminder ? "care.reminderOn" : "care.reminderOff",
						)}
					/>
				</View>
				<Text className="text-xs text-muted">
					{dueDate
						? dueLabel(dueDate, today)
						: lastDoneLabel(care.lastDoneAt, new Date())}
				</Text>
				{progress !== null && (
					<View
						className={twMerge(
							"h-1 overflow-hidden rounded-xs",
							appearance.tint,
						)}
					>
						<View
							className={twMerge("h-full rounded-xs", appearance.background)}
							style={{ width: `${progress * 100}%` }}
						/>
					</View>
				)}
			</View>
			{!plant.archivedAt && (
				<Button
					variant="ghost"
					title={careVerb(care.type)}
					className="h-9 bg-primary-tint px-4"
					onPress={() => done(care)}
				/>
			)}
		</View>
	);
}
