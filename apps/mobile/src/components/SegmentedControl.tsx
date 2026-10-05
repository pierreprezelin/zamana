import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
	type SharedValue,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { INDICATOR_TIMING } from "@/components/TabBar";
import Text from "@/components/Text";

const CONTAINER_PADDING = 2;

type SegmentedControlProps<T extends string> = {
	options: { value: T; label: string }[];
	value: T;
	onChange: (value: T) => void;
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
			className="h-8 flex-1 items-center justify-center px-2"
		>
			<View>
				<Text className="text-moss">{label}</Text>
				<Animated.View style={[StyleSheet.absoluteFill, onIndicatorStyle]}>
					<Text className="text-white">{label}</Text>
				</Animated.View>
			</View>
		</Pressable>
	);
}

export default function SegmentedControl<T extends string>({
	options,
	value,
	onChange,
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
			className="h-9 flex-row rounded-[12px] bg-forest-tint p-[2px]"
		>
			<Animated.View
				style={indicatorStyle}
				className="absolute left-[2px] top-[2px] h-8 rounded-[10px] bg-forest"
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
