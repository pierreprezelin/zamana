import { type ReactNode, useRef } from "react";
import Swipeable, {
	type SwipeableMethods,
	SwipeDirection,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
	type SharedValue,
	useAnimatedReaction,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { careAppearance } from "@/features/care/careAppearance";
import { careVerb } from "@/features/care/careLabels";
import type { CareType } from "@/features/care/careTypes";
import {
	crossedThreshold,
	SWIPE_THRESHOLD,
} from "@/features/care/swipeThreshold";
import { selectionFeedback } from "@/utils/haptics";
import { t } from "@/utils/i18n";
import { twMerge } from "@/utils/twMerge";

export type SwipeAction = "done" | "skip" | "undo";

type CareIconButtonProps = {
	icon: IoniconsIconName;
	label: string;
	className?: string;
	iconClassName: string;
	// Mirrors refresh-outline into a counter-clockwise arrow
	mirrored?: boolean;
	onPress: () => void;
};

export function CareIconButton({
	icon,
	label,
	className,
	iconClassName,
	mirrored,
	onPress,
}: CareIconButtonProps) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={label}
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

type SwipePanelProps = {
	type: CareType;
	action: SwipeAction;
	side: "left" | "right";
	translation: SharedValue<number>;
	// False while the row opens and closes itself after a release
	dragging: SharedValue<boolean>;
	className?: string;
};

function SwipePanel({
	type,
	action,
	side,
	translation,
	dragging,
	className,
}: SwipePanelProps) {
	const appearance = careAppearance[type];

	const dragOnThisSide = useDerivedValue(() =>
		side === "left" ? translation.get() : -translation.get(),
	);

	// Ticks when the drag crosses the distance that triggers the action, both ways
	useAnimatedReaction(
		() => dragOnThisSide.get(),
		(current, previous) => {
			if (dragging.get() && crossedThreshold(previous, current))
				scheduleOnRN(selectionFeedback);
		},
	);

	// At rest the panel would show through the rounded corners of the row
	const visibleStyle = useAnimatedStyle(() => ({
		opacity: dragOnThisSide.get() > 0 ? 1 : 0,
	}));

	return (
		<Animated.View
			style={visibleStyle}
			className={twMerge(
				"w-28 items-center justify-center rounded-xl px-2",
				action === "done" ? appearance.background : "bg-background",
				className,
			)}
		>
			<Text
				className={twMerge(
					"text-center font-outfit-semibold",
					action === "done"
						? "text-surface"
						: action === "skip"
							? appearance.text
							: "text-foreground",
				)}
			>
				{/* The care's own verb, as on the buttons of the to-do cards */}
				{action === "done" ? careVerb(type) : t(`care.swipe.${action}`)}
			</Text>
		</Animated.View>
	);
}

type CareSwipeableProps = {
	type: CareType;
	// Revealed by dragging the row to the right, and to the left
	leftAction: SwipeAction;
	rightAction: SwipeAction;
	onAction: (action: SwipeAction) => void;
	// Matches the radius of the row it reveals
	panelClassName?: string;
	children: ReactNode;
};

export function CareSwipeable({
	type,
	leftAction,
	rightAction,
	onAction,
	panelClassName,
	children,
}: CareSwipeableProps) {
	const swipeableRef = useRef<SwipeableMethods>(null);
	const dragging = useSharedValue(true);

	return (
		<Swipeable
			ref={swipeableRef}
			friction={1.5}
			// Stops the row at the panel width instead of dragging it across
			overshootLeft={false}
			overshootRight={false}
			leftThreshold={SWIPE_THRESHOLD}
			rightThreshold={SWIPE_THRESHOLD}
			renderLeftActions={(_progress, translation) => (
				<SwipePanel
					type={type}
					action={leftAction}
					side="left"
					translation={translation}
					dragging={dragging}
					className={panelClassName}
				/>
			)}
			renderRightActions={(_progress, translation) => (
				<SwipePanel
					type={type}
					action={rightAction}
					side="right"
					translation={translation}
					dragging={dragging}
					className={panelClassName}
				/>
			)}
			onSwipeableWillOpen={() => dragging.set(false)}
			onSwipeableClose={() => dragging.set(true)}
			onSwipeableOpen={(direction) => {
				// The callback gets the drag direction: dragging right opens the left panel
				onAction(direction === SwipeDirection.RIGHT ? leftAction : rightAction);
				swipeableRef.current?.close();
			}}
		>
			{children}
		</Swipeable>
	);
}
