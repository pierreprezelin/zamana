import { type ReactNode, useRef } from "react";
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
import { careVerb } from "@/features/care/careLabels";
import type { CareType } from "@/features/care/careTypes";
import { t } from "@/utils/i18n";

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
	const appearance = careAppearance[type];
	const swipeableRef = useRef<SwipeableMethods>(null);

	const panel = (action: SwipeAction, side: "left" | "right") => (
		<View
			className={twMerge(
				"w-28 justify-center rounded-xl px-4",
				side === "right" && "items-end",
				action === "done" ? appearance.background : "bg-background",
				panelClassName,
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
				{/* The care's own verb, as on the buttons of the to-do cards */}
				{action === "done" ? careVerb(type) : t(`care.swipe.${action}`)}
			</Text>
		</View>
	);

	return (
		<Swipeable
			ref={swipeableRef}
			friction={1.5}
			// Stops the row at the panel width instead of dragging it across
			overshootLeft={false}
			overshootRight={false}
			leftThreshold={64}
			rightThreshold={64}
			renderLeftActions={() => panel(leftAction, "left")}
			renderRightActions={() => panel(rightAction, "right")}
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
