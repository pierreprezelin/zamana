import { View } from "react-native";
import Toast from "react-native-toast-message";
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
import { nextDueDate } from "@/features/care/careSchedule";
import type { Care } from "@/features/care/careTypes";
import { CareBadge } from "@/features/care/components/CareBadge";
import { useCareActions } from "@/features/care/useCareActions";
import { useCarePreferencesStore } from "@/features/care/useCarePreferencesStore";
import type { Plant } from "@/features/plants/plantSchema";
import { t } from "@/utils/i18n";

type UpcomingCareRowProps = {
	care: Care;
	plant: Plant;
	dueDate: string | null;
	progress: number | null;
	today: string;
};

const upcomingLabel = (care: Care, dueDate: string | null, today: string) => {
	if (!dueDate) return lastDoneLabel(care.lastDoneAt, new Date());
	const due = dueLabel(dueDate, today);
	return care.lastDoneAt === today
		? `${t("care.lastDone.today")} · ${due.toLocaleLowerCase()}`
		: due;
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
	const name = careName(care.type);

	const doEarly = async () => {
		if (!(await done(care))) return;
		// Done ahead of time, the row barely changes: say it was noted
		const next = nextDueDate(
			{ ...care, lastDoneAt: today, snoozedUntil: null },
			{
				wateringLevel: plant.watering,
				climate: useCarePreferencesStore.getState().climate,
			},
			today,
		);
		Toast.show({
			type: "success",
			text1: next
				? t("care.doneEarly", {
						care: name,
						due: dueLabel(next, today).toLocaleLowerCase(),
					})
				: t("care.doneNoted", { care: name }),
		});
	};

	return (
		<View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-4">
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
					{upcomingLabel(care, dueDate, today)}
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
			{/* Done today from the form: once a day, nothing left to do */}
			{!plant.archivedAt && care.lastDoneAt !== today && (
				<Button
					variant="ghost"
					title={careVerb(care.type)}
					className="h-9 bg-primary-tint px-4"
					onPress={doEarly}
				/>
			)}
		</View>
	);
}
