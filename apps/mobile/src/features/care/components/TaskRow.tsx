import { View } from "react-native";
import Text from "@/components/Text";
import { careAppearance } from "@/features/care/careAppearance";
import { careName, dueLabel, handledLabel } from "@/features/care/careLabels";
import { CareBadge } from "@/features/care/components/CareBadge";
import {
	CareIconButton,
	CareSwipeable,
	type SwipeAction,
} from "@/features/care/components/CareSwipeable";
import type { TodayTask } from "@/features/care/todayTasks";
import { useCareActions } from "@/features/care/useCareActions";
import { useCarePreferencesStore } from "@/features/care/useCarePreferencesStore";
import type { Plant } from "@/features/plants/plantSchema";
import { t } from "@/utils/i18n";
import { twMerge } from "@/utils/twMerge";

type TaskRowProps = { task: TodayTask; plant: Plant; today: string };

export function TaskRow({ task, plant, today }: TaskRowProps) {
	const { care, handledLog } = task;
	const appearance = careAppearance[care.type];
	const swipeLeft = useCarePreferencesStore((state) => state.swipeLeft);
	const { done, skip, undo } = useCareActions();
	const name = careName(care.type);

	const run = (action: SwipeAction) => {
		if (action === "done") return done(care);
		if (action === "skip") return skip(care, plant);
		if (handledLog) return undo(handledLog);
	};

	// Dragging the row to the left reveals its right panel
	const otherAction: SwipeAction = swipeLeft === "done" ? "skip" : "done";
	const rightAction: SwipeAction = handledLog ? "undo" : swipeLeft;
	const leftAction: SwipeAction = handledLog ? "undo" : otherAction;

	return (
		<CareSwipeable
			type={care.type}
			leftAction={leftAction}
			rightAction={rightAction}
			onAction={run}
		>
			{/* Remounts the row: Android loses the badge radius when its background changes in place */}
			{handledLog ? (
				<View
					key="handled"
					className="flex-row items-center gap-3 rounded-xl border border-line bg-surface p-2"
				>
					<CareBadge type={care.type} size={32} muted />
					<View className="flex-1">
						<Text
							className={twMerge(
								"font-outfit-semibold text-muted",
								handledLog.outcome === "done" && "line-through",
							)}
						>
							{name}
						</Text>
						<Text className="text-xs text-foreground">
							{handledLabel(handledLog, task.dueDate, today)}
						</Text>
					</View>
					<CareIconButton
						icon="refresh-outline"
						mirrored
						label={t("care.undo", { care: name })}
						iconClassName="text-muted"
						onPress={() => run("undo")}
					/>
				</View>
			) : (
				<View
					key="pending"
					className={twMerge(
						"flex-row items-center gap-3 rounded-xl p-2",
						appearance.tint,
					)}
				>
					<CareBadge type={care.type} size={32} onTint />
					<View className="flex-1">
						<Text className="font-outfit-semibold text-foreground">{name}</Text>
						<Text
							className={twMerge(
								"text-xs",
								task.status.kind === "late"
									? "font-outfit-semibold text-danger"
									: "text-muted",
							)}
						>
							{dueLabel(task.dueDate, today)}
						</Text>
					</View>
					<View className="flex-row gap-2">
						<CareIconButton
							icon="hourglass-outline"
							label={t("care.skipCare", { care: name })}
							iconClassName={appearance.text}
							onPress={() => run("skip")}
						/>
						<CareIconButton
							icon="checkmark-outline"
							label={t("care.markDone", { care: name })}
							className={appearance.background}
							iconClassName="text-surface"
							onPress={() => run("done")}
						/>
					</View>
				</View>
			)}
		</CareSwipeable>
	);
}
