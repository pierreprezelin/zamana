import { forwardRef, type ReactNode } from "react";
import {
	Pressable as RNPressable,
	type PressableProps as RNPressableProps,
	type View,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { twMerge } from "tailwind-merge";

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export interface PressableProps extends Omit<RNPressableProps, "children"> {
	children?: ReactNode;
	className?: string;
	pressedClassName?: string;
	pressedOpacity?: number;
}

const Pressable = forwardRef<View, PressableProps>(
	(
		{
			className,
			pressedClassName = "bg-white/10",
			pressedOpacity = 1,
			disabled,
			style,
			children,
			...props
		},
		ref,
	) => {
		const pressed = useSharedValue(0);

		const pressableStyle = useAnimatedStyle(() => ({
			transform: [{ scale: 1 - 0.01 * pressed.value }],
			opacity: disabled ? 0.75 : 1 - (1 - pressedOpacity) * pressed.value,
		}));

		const overlayStyle = useAnimatedStyle(() => ({
			opacity: pressed.value,
		}));

		return (
			<AnimatedPressable
				ref={ref}
				disabled={disabled}
				onPressIn={() => {
					pressed.value = withTiming(1, { duration: 80 });
				}}
				onPressOut={() => {
					pressed.value = withSequence(
						withTiming(1, { duration: 80 }),
						withTiming(0, { duration: 120 }),
					);
				}}
				style={[pressableStyle, style]}
				className={twMerge("overflow-hidden", className)}
				{...props}
			>
				<Animated.View
					className={twMerge("absolute inset-0", pressedClassName)}
					style={overlayStyle}
				/>
				{children}
			</AnimatedPressable>
		);
	},
);

export default Pressable;
