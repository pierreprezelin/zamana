import { View } from "react-native";
import Button from "@/components/Button";
import Text from "@/components/Text";
import { careAppearance } from "@/features/care/careAppearance";
import {
	careName,
	careSubtitle,
	careVerb,
	handledLabel,
} from "@/features/care/careLabels";
import type { CareStatus } from "@/features/care/careSchedule";
import type { Care, CareLog } from "@/features/care/careTypes";
import { CareBadge } from "@/features/care/components/CareBadge";
import {
	CareIconButton,
	CareSwipeable,
} from "@/features/care/components/CareSwipeable";
import { useCareActions } from "@/features/care/useCareActions";
import type { Plant } from "@/features/plants/plantSchema";
import { pluralForm, t } from "@/utils/i18n";
import { twMerge } from "@/utils/twMerge";

type DueCareCardProps = {
	care: Care;
	plant: Plant;
	status: CareStatus;
};

export function DueCareCard({ care, plant, status }: DueCareCardProps) {
	const appearance = careAppearance[care.type];
	const { done, skip } = useCareActions();

	return (
		<View className={twMerge("gap-3 rounded-2xl p-4", appearance.tint)}>
			<View className="flex-row items-center gap-3">
				<CareBadge type={care.type} size={48} onTint />
				<View className="flex-1 gap-0.5">
					<View className="flex-row flex-wrap items-center gap-2">
						<Text className="font-outfit-semibold text-base text-foreground">
							{careName(care.type)}
						</Text>
						{status.kind === "late" && (
							// iOS does not round a Text background, hence the View
							<View className="rounded-full bg-danger px-2 py-0.5">
								<Text
									numberOfLines={1}
									accessibilityLabel={t(
										`care.due.late.${pluralForm(status.days)}`,
										{ amount: status.days },
									)}
									className="font-outfit-semibold text-xs text-on-danger"
								>
									{t("care.due.lateShort", { amount: status.days })}
								</Text>
							</View>
						)}
					</View>
					<Text className="text-xs text-muted">
						{careSubtitle(care, plant.watering, new Date())}
					</Text>
				</View>
			</View>
			<View className="flex-row gap-2">
				<Button
					variant="ghost"
					title={t("care.skip")}
					icon="hourglass-outline"
					size="small"
					className="flex-1 bg-surface px-3"
					textClassName={appearance.text}
					onPress={() => skip(care, plant)}
				/>
				<Button
					title={careVerb(care.type)}
					icon="checkmark-outline"
					size="small"
					className={twMerge("flex-1 px-3", appearance.background)}
					textClassName="text-surface"
					onPress={() => done(care)}
				/>
			</View>
		</View>
	);
}

type HandledCareCardProps = {
	care: Care;
	handledLog: CareLog;
	dueDate: string | null;
	today: string;
};

// A care done or skipped today, kept in place until the day is over so it can be undone
export function HandledCareCard({
	care,
	handledLog,
	dueDate,
	today,
}: HandledCareCardProps) {
	const { undo } = useCareActions();
	const name = careName(care.type);

	return (
		<CareSwipeable
			type={care.type}
			leftAction="undo"
			rightAction="undo"
			onAction={() => undo(handledLog)}
			panelClassName="rounded-2xl"
		>
			<View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-4">
				<CareBadge type={care.type} size={48} muted />
				<View className="flex-1 gap-0.5">
					<Text
						className={twMerge(
							"font-outfit-semibold text-base text-muted",
							handledLog.outcome === "done" && "line-through",
						)}
					>
						{name}
					</Text>
					<Text className="text-xs text-foreground">
						{handledLabel(handledLog, dueDate, today)}
					</Text>
				</View>
				<CareIconButton
					icon="refresh-outline"
					mirrored
					label={t("care.undo", { care: name })}
					className="size-9"
					iconClassName="text-muted"
					onPress={() => undo(handledLog)}
				/>
			</View>
		</CareSwipeable>
	);
}
