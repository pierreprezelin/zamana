import { useRef } from "react";
import type { HostInstance, TextInstance } from "react-native";
import Animated, {
	Extrapolation,
	interpolate,
	type SharedValue,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";

// The screen title lives in the content: it shows up in the header as the header covers it
export function useFadingHeaderTitle<
	Container extends HostInstance = HostInstance,
>() {
	const scrollY = useSharedValue(0);
	const titleTop = useSharedValue(0);
	const titleBottom = useSharedValue(0);
	// What scrolls under the header, the title is measured from its top
	const containerRef = useRef<Container>(null);
	const titleRef = useRef<TextInstance>(null);
	const onScroll = useAnimatedScrollHandler((event) => {
		scrollY.set(event.contentOffset.y);
	});
	const onTitleLayout = () => {
		if (!containerRef.current) return;
		titleRef.current?.measureLayout(containerRef.current, (_x, y, _w, h) => {
			titleTop.set(y);
			titleBottom.set(y + h);
		});
	};
	return {
		scrollY,
		titleTop,
		titleBottom,
		onScroll,
		containerRef,
		titleRef,
		onTitleLayout,
	};
}

type Props = {
	title: string;
	scrollY: SharedValue<number>;
	titleTop: SharedValue<number>;
	titleBottom: SharedValue<number>;
};

export function FadingHeaderTitle({
	title,
	scrollY,
	titleTop,
	titleBottom,
}: Props) {
	const style = useAnimatedStyle(() => ({
		opacity: interpolate(
			scrollY.get(),
			[titleTop.get(), titleBottom.get()],
			[0, 1],
			Extrapolation.CLAMP,
		),
	}));
	return (
		<Animated.Text
			numberOfLines={1}
			// Already read from the content title
			accessibilityElementsHidden
			importantForAccessibility="no-hide-descendants"
			style={style}
			className="font-recoleta text-card-title text-foreground"
		>
			{title}
		</Animated.Text>
	);
}
