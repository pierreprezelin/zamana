import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
	type SharedValue,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { twMerge } from "tailwind-merge";
import { INDICATOR_TIMING } from "@/components/TabBar";
import Text from "@/components/Text";

const CONTAINER_PADDING = 2;

type SegmentedControlProps<T extends string> = {
	options: { value: T; label: string }[];
	value: T;
	onChange: (value: T) => void;
	className?: string;
};

type SegmentProps = {
	label: string;
	index: number;
	selected: boolean;
	indicatorPosition: SharedValue<number>;
	onPress: () => void;
};

function Segment({
	label,
	index,
	selected,
	indicatorPosition,
	onPress,
}: SegmentProps) {
	// The label turns white as the indicator slides under it
	const onIndicatorStyle = useAnimatedStyle(() => ({
		opacity: Math.max(0, 1 - Math.abs(indicatorPosition.get() - index)),
	}));

	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="radio"
			accessibilityState={{ checked: selected }}
			className="flex-1 items-center justify-center px-2"
		>
			<View>
				<Text className="text-foreground">{label}</Text>
				<Animated.View style={[StyleSheet.absoluteFill, onIndicatorStyle]}>
					<Text className="text-on-primary">{label}</Text>
				</Animated.View>
			</View>
		</Pressable>
	);
}

export default function SegmentedControl<T extends string>({
	options,
	value,
	onChange,
	className,
}: SegmentedControlProps<T>) {
	const selectedIndex = options.findIndex((option) => option.value === value);
	const [segmentWidth, setSegmentWidth] = useState(0);
	const indicatorPosition = useSharedValue(selectedIndex);

	useEffect(() => {
		indicatorPosition.set(withTiming(selectedIndex, INDICATOR_TIMING));
	}, [selectedIndex, indicatorPosition]);

	const indicatorStyle = useAnimatedStyle(() => ({
		width: segmentWidth,
		transform: [{ translateX: indicatorPosition.get() * segmentWidth }],
	}));

	return (
		<View
			accessibilityRole="radiogroup"
			onLayout={(event) =>
				setSegmentWidth(
					(event.nativeEvent.layout.width - CONTAINER_PADDING * 2) /
						options.length,
				)
			}
			className={twMerge(
				"h-9 flex-row rounded-xl bg-primary-tint p-0.5",
				className,
			)}
		>
			<Animated.View
				style={indicatorStyle}
				className="absolute bottom-0.5 left-0.5 top-0.5 rounded-[10px] bg-primary"
			/>
			{options.map((option, index) => (
				<Segment
					key={option.value}
					label={option.label}
					index={index}
					selected={index === selectedIndex}
					indicatorPosition={indicatorPosition}
					onPress={() => onChange(option.value)}
				/>
			))}
		</View>
	);
}
