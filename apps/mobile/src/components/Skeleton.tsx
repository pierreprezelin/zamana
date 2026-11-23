import { type ReactNode, useEffect } from "react";
import { View } from "react-native";
import Animated, {
	ReduceMotion,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import { twMerge } from "tailwind-merge";
import { withUniwind } from "uniwind";
import { t } from "@/utils/i18n";

const StyledAnimatedView = withUniwind(Animated.View);

const PULSE_MS = 800;

// One animation for a whole loading layout, so its placeholders pulse together
export function SkeletonGroup({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	const opacity = useSharedValue(1);

	useEffect(() => {
		opacity.value = withRepeat(
			withTiming(0.4, {
				duration: PULSE_MS,
				reduceMotion: ReduceMotion.System,
			}),
			-1,
			true,
		);
	}, [opacity]);

	const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

	return (
		<StyledAnimatedView
			accessible
			accessibilityRole="progressbar"
			accessibilityLabel={t("common.loading")}
			className={className}
			style={pulse}
		>
			{children}
		</StyledAnimatedView>
	);
}

// Stands for content still loading, with its size and shape, inside a SkeletonGroup
export function Bone({ className }: { className?: string }) {
	return <View className={twMerge("rounded-xl bg-primary-tint", className)} />;
}

export default function Skeleton({ className }: { className?: string }) {
	return (
		<SkeletonGroup className={twMerge("overflow-hidden rounded-xl", className)}>
			<Bone className="flex-1 rounded-none" />
		</SkeletonGroup>
	);
}
