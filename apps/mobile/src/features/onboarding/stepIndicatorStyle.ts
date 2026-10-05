import { Extrapolation, interpolate } from "react-native-reanimated";

const DOT_WIDTH = 4;
const ACTIVE_WIDTH = 36;
const UPCOMING_OPACITY = 0.5;

export function stepIndicatorStyle(progress: number, index: number) {
	"worklet";
	return {
		width: interpolate(
			Math.abs(progress - index),
			[0, 1],
			[ACTIVE_WIDTH, DOT_WIDTH],
			Extrapolation.CLAMP,
		),
		opacity: interpolate(
			progress,
			[index - 1, index],
			[UPCOMING_OPACITY, 1],
			Extrapolation.CLAMP,
		),
	};
}
