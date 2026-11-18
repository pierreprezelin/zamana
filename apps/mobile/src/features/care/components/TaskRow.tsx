import { useRef } from "react";
import { View } from "react-native";
import Swipeable, {
	type SwipeableMethods,
	SwipeDirection,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { twMerge } from "tailwind-merge";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { careAppearance } from "@/features/care/careAppearance";
import { careName, doneAtLabel, dueLabel } from "@/features/care/careLabels";
import { CareBadge } from "@/features/care/components/CareBadge";
import type { TodayTask } from "@/features/care/todayTasks";
import { useCareActions } from "@/features/care/useCareActions";
import { useCarePreferencesStore } from "@/features/care/useCarePreferencesStore";
import type { Plant } from "@/features/plants/plantSchema";
import { t } from "@/utils/i18n";

type Action = "done" | "skip" | "undo";

type IconButtonProps = {
	icon: IoniconsIconName;
	label: string;
	className?: string;
	iconClassName: string;
	// Mirrors refresh-outline into a counter-clockwise arrow
	mirrored?: boolean;
	onPress: () => void;
};

function IconButton({
	icon,
	label,
	className,
	iconClassName,
	mirrored,
	onPress,
}: IconButtonProps) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={label}
			pressedClassName=""
			pressedOpacity={0.6}
			// 32 + 2 × 6 reaches the 44 points touch target
			hitSlop={6}
			className={twMerge(
				"size-8 items-center justify-center rounded-xl",
				className,
			)}
			onPress={onPress}
		>
			<Ionicons
				name={icon}
				size={18}
				className={iconClassName}
				style={mirrored ? { transform: [{ scaleX: -1 }] } : undefined}
			/>
		</Pressable>
	);
}

type TaskRowProps = { task: TodayTask; plant: Plant; today: string };

export function TaskRow({ task, plant, today }: TaskRowProps) {
	const { care, doneLog } = task;
	const appearance = careAppearance[care.type];
	const swipeRight = useCarePreferencesStore((state) => state.swipeRight);
	const { done, skip, undo } = useCareActions();
	const swipeableRef = useRef<SwipeableMethods>(null);
	const name = careName(care.type);

	const run = (action: Action) => {
		if (action === "done") return done(care);
		if (action === "skip") return skip(care, plant);
		if (doneLog) return undo(doneLog.id);
	};

	// Dragging to the right reveals the left panel, and reports a RIGHT swipe
	const leftAction: Action = doneLog ? "undo" : swipeRight;
	const rightAction: Action = doneLog
		? "undo"
		: swipeRight === "done"
			? "skip"
			: "done";

	const panel = (action: Action, side: "left" | "right") => (
		<View
			className={twMerge(
				"w-28 justify-center rounded-xl px-4",
				side === "right" && "items-end",
				action === "done" ? appearance.background : "bg-background",
			)}
		>
			<Text
				className={twMerge(
					"font-outfit-semibold",
					action === "done"
						? "text-surface"
						: action === "skip"
							? appearance.text
							: "text-foreground",
				)}
			>
				{t(`care.swipe.${action}`)}
			</Text>
		</View>
	);

	return (
		<Swipeable
			ref={swipeableRef}
			friction={1.5}
			leftThreshold={64}
			rightThreshold={64}
			renderLeftActions={() => panel(leftAction, "left")}
			renderRightActions={() => panel(rightAction, "right")}
			onSwipeableOpen={(direction) => {
				run(direction === SwipeDirection.RIGHT ? leftAction : rightAction);
				swipeableRef.current?.close();
			}}
		>
			{doneLog ? (
				<View className="flex-row items-center gap-3 rounded-xl border border-line bg-surface py-2.5 pr-2.5 pl-3">
					<CareBadge type={care.type} size={32} muted />
					<View className="flex-1">
						<Text className="font-outfit-semibold text-muted line-through">
							{name}
						</Text>
						<Text className="text-xs text-foreground">
							{doneAtLabel(doneLog.createdAt)}
						</Text>
					</View>
					<IconButton
						icon="refresh-outline"
						mirrored
						label={t("care.undo", { care: name })}
						iconClassName="text-muted"
						onPress={() => run("undo")}
					/>
				</View>
			) : (
				<View
					className={twMerge(
						"flex-row items-center gap-3 rounded-xl py-2.5 pr-2.5 pl-3",
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
						<IconButton
							icon="hourglass-outline"
							label={t("care.skipCare", { care: name })}
							iconClassName={appearance.text}
							onPress={() => run("skip")}
						/>
						<IconButton
							icon="checkmark-outline"
							label={t("care.markDone", { care: name })}
							className={appearance.background}
							iconClassName="text-surface"
							onPress={() => run("done")}
						/>
					</View>
				</View>
			)}
		</Swipeable>
	);
}
