import { forwardRef } from "react";
import {
	Pressable as RNPressable,
	type PressableProps as RNPressableProps,
	type View,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { twMerge } from "tailwind-merge";
import Text from "@/components/Text";

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

interface PressableProps extends RNPressableProps {
	className?: string;
	textClassName?: string;
	title: string;
	disabled?: boolean;
}

const Pressable = forwardRef<View, PressableProps>(
	({ title, className, textClassName, disabled, ...props }, ref) => {
		const scale = useSharedValue(1);

		const animatedStyle = useAnimatedStyle(() => ({
			transform: [{ scale: scale.value }],
		}));

		return (
			<AnimatedPressable
				ref={ref}
				disabled={disabled}
				onPressIn={() => {
					scale.value = withTiming(0.99, { duration: 80 });
				}}
				onPressOut={() => {
					scale.value = withTiming(1, { duration: 120 });
				}}
				style={animatedStyle}
				className={twMerge(
					"group items-center justify-center rounded-[12px] bg-forest px-8 h-[48px]",
					disabled && "opacity-75",
					className,
				)}
				{...props}
			>
				<Text
					className={twMerge(
						"font-outfit-semibold text-center text-white",
						textClassName,
					)}
				>
					{title}
				</Text>
			</AnimatedPressable>
		);
	},
);

export default Pressable;
