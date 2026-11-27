import { Link } from "expo-router";
import { View } from "react-native";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { careAppearance } from "@/features/care/careAppearance";
import {
	careName,
	handledLabel,
	upcomingLabel,
} from "@/features/care/careLabels";
import type { CareOverviewEntry } from "@/features/care/careOverview";
import { careStatus, isDue } from "@/features/care/careSchedule";
import {
	CareProgressBar,
	ReminderIcon,
} from "@/features/care/components/CareRowDetails";
import {
	CareIconButton,
	CareSwipeable,
	type SwipeAction,
} from "@/features/care/components/CareSwipeable";
import { useCareActions } from "@/features/care/useCareActions";
import { useCarePreferencesStore } from "@/features/care/useCarePreferencesStore";
import { PlantPhoto } from "@/features/plants/components/PlantPhoto";
import { displayName } from "@/features/plants/plantLabels";
import { t } from "@/utils/i18n";
import { twMerge } from "@/utils/twMerge";

type CarePlantRowProps = {
	entry: CareOverviewEntry;
	today: string;
	remindersOff: boolean;
};

// The row of a task on Today, with the plant in place of the care
export function CarePlantRow({
	entry: { plant, care, dueDate, progress, handledLog },
	today,
	remindersOff,
}: CarePlantRowProps) {
	const appearance = careAppearance[care.type];
	const swipeLeft = useCarePreferencesStore((state) => state.swipeLeft);
	const { done, doneEarly, skip, undo } = useCareActions();
	const name = careName(care.type);
	const due = !handledLog && isDue(dueDate, today);
	const late =
		due && dueDate !== null && careStatus(dueDate, today).kind === "late";
	// Done today from the form: once a day, nothing left to do
	const canDoEarly = !handledLog && !due && care.lastDoneAt !== today;

	const run = (action: SwipeAction) => {
		if (action === "done") return done(care);
		if (action === "skip") return skip(care, plant);
		if (handledLog) return undo(handledLog);
	};

	// Dragging the row to the left reveals its right panel
	const otherAction: SwipeAction = swipeLeft === "done" ? "skip" : "done";

	const row = (
		// The actions sit beside the link, so screen readers reach each of them
		<View className="flex-row items-center gap-3 rounded-xl bg-surface p-2">
			<Link href={`/plant/${plant.id}/care`} asChild>
				<Pressable
					accessibilityRole="link"
					pressedOpacity={0.75}
					className="flex-1 flex-row items-center gap-3"
				>
					<PlantPhoto
						photo={plant.photo}
						className="size-9 rounded-xl"
						iconSize={16}
					/>
					<View className="flex-1">
						<View className="flex-row items-center gap-1.5">
							<Text
								numberOfLines={1}
								className={twMerge(
									"shrink font-outfit-semibold",
									handledLog ? "text-muted" : "text-foreground",
									handledLog?.outcome === "done" && "line-through",
								)}
							>
								{displayName(plant)}
							</Text>
							{!handledLog && (
								<ReminderIcon notified={care.reminder && !remindersOff} />
							)}
						</View>
						<Text
							numberOfLines={1}
							className={twMerge(
								"text-xs",
								late && "font-outfit-semibold text-danger",
								!late && (handledLog ? "text-foreground" : "text-muted"),
							)}
						>
							{handledLog
								? handledLabel(handledLog, dueDate, today)
								: upcomingLabel(care, dueDate, today)}
						</Text>
						{!handledLog && !due && progress !== null && (
							<CareProgressBar type={care.type} progress={progress} />
						)}
					</View>
				</Pressable>
			</Link>
			<View className="flex-row gap-2">
				{handledLog && (
					<CareIconButton
						icon="refresh-outline"
						mirrored
						label={t("care.undo", { care: name })}
						iconClassName="text-muted"
						onPress={() => run("undo")}
					/>
				)}
				{due && (
					<CareIconButton
						icon="hourglass-outline"
						label={t("care.skipCare", { care: name })}
						iconClassName={appearance.text}
						onPress={() => run("skip")}
					/>
				)}
				{(due || canDoEarly) && (
					<CareIconButton
						icon="checkmark-outline"
						label={t("care.markDone", { care: name })}
						className={due ? appearance.background : appearance.tint}
						iconClassName={due ? "text-surface" : appearance.text}
						onPress={() => (due ? run("done") : doneEarly(care, plant, today))}
					/>
				)}
			</View>
		</View>
	);

	// Swipes like a task on Today; an upcoming care is only done ahead from its button
	if (!due && !handledLog) return row;
	return (
		<CareSwipeable
			type={care.type}
			leftAction={handledLog ? "undo" : otherAction}
			rightAction={handledLog ? "undo" : swipeLeft}
			onAction={run}
		>
			{row}
		</CareSwipeable>
	);
}
