import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { INDICATOR_TIMING } from "@/components/TabBar";

const KNOB_TRAVEL = 20;

type ToggleProps = {
	value: boolean;
	onChange: (value: boolean) => void;
	accessibilityLabel: string;
};

export default function Toggle({
	value,
	onChange,
	accessibilityLabel,
}: ToggleProps) {
	const progress = useSharedValue(Number(value));

	useEffect(() => {
		progress.set(withTiming(Number(value), INDICATOR_TIMING));
	}, [value, progress]);

	const knobStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: progress.get() * KNOB_TRAVEL }],
	}));
	const onTrackStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));

	return (
		<Pressable
			accessibilityRole="switch"
			accessibilityLabel={accessibilityLabel}
			accessibilityState={{ checked: value }}
			hitSlop={12}
			onPress={() => onChange(!value)}
		>
			<View className="h-6 w-11 overflow-hidden rounded-full">
				<View className="absolute inset-0 bg-primary-tint-strong" />
				<Animated.View
					style={onTrackStyle}
					className="absolute inset-0 bg-primary"
				/>
				<Animated.View
					style={knobStyle}
					className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white"
				/>
			</View>
		</Pressable>
	);
}
