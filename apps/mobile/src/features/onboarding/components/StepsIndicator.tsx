import { View } from "react-native";
import Animated, {
	type SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";
import { stepIndicatorStyle } from "@/features/onboarding/stepIndicatorStyle";

type StepsIndicatorProps = {
	count: number;
	progress: SharedValue<number>;
};

function Step({
	index,
	progress,
}: {
	index: number;
	progress: SharedValue<number>;
}) {
	const style = useAnimatedStyle(() =>
		stepIndicatorStyle(progress.value, index),
	);

	return <Animated.View className="h-1 rounded-full bg-forest" style={style} />;
}

export function StepsIndicator({ count, progress }: StepsIndicatorProps) {
	return (
		<View className="flex-row gap-1">
			{Array.from({ length: count }, (_, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length list, the index is the step identity
				<Step key={index} index={index} progress={progress} />
			))}
		</View>
	);
}
