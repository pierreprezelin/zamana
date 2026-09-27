import { Link } from "expo-router";
import type { TabTriggerSlotProps } from "expo-router/ui";
import { useCallback, useEffect, useState } from "react";
import {
	type LayoutRectangle,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Animated, {
	Easing,
	ReduceMotion,
	type SharedValue,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import PressFeedback from "@/components/Pressable";
import type { tabs } from "@/constants/tabs";

const MIN_BOTTOM_OFFSET = 20;

export const TAB_BAR_SHADOW = "0px 8px 24px rgba(8, 41, 30, 0.15)";

export const INDICATOR_TIMING = {
	duration: 250,
	easing: Easing.bezier(0.77, 0, 0.175, 1),
	reduceMotion: ReduceMotion.System,
};

type TabBarItemProps = TabTriggerSlotProps & {
	label: string;
	icon: (typeof tabs)[number]["icon"];
	onFocusedLayout: (layout: LayoutRectangle) => void;
	indicatorTravel: IndicatorTravel;
};

function TabBarItemContent({
	label,
	iconName,
	colorClassName,
}: {
	label: string;
	iconName: IoniconsIconName;
	colorClassName: string;
}) {
	return (
		<View className="items-center">
			<Ionicons name={iconName} size={20} className={colorClassName} />
			<Text
				className={`font-outfit text-[10px] leading-[15px] ${colorClassName}`}
			>
				{label}
			</Text>
		</View>
	);
}

export function TabBarItem({
	label,
	icon,
	isFocused,
	onFocusedLayout,
	indicatorTravel,
	style: _injectedRowStyle,
	...props
}: TabBarItemProps) {
	const [layout, setLayout] = useState<LayoutRectangle>();
	const itemX = useSharedValue(0);

	useEffect(() => {
		if (isFocused && layout) onFocusedLayout(layout);
	}, [isFocused, layout, onFocusedLayout]);

	// Only the origin and destination tabs follow the indicator, the ones it crosses stay still
	const coverage = useDerivedValue(() => {
		const progress = indicatorTravel.progress.get();
		if (isFocused) return progress;
		return itemX.get() === indicatorTravel.originX.get() ? 1 - progress : 0;
	});

	const defaultStyle = useAnimatedStyle(() => ({
		opacity: 1 - coverage.get(),
	}));
	const selectedStyle = useAnimatedStyle(() => ({
		opacity: coverage.get(),
	}));

	return (
		<Pressable
			{...props}
			onLayout={(event) => {
				const measured = event.nativeEvent.layout;
				itemX.set(measured.x);
				setLayout(measured);
			}}
			accessibilityRole="tab"
			accessibilityState={{ selected: isFocused }}
			className="h-[50px] grow items-center justify-center px-2"
		>
			<View>
				<Animated.View style={defaultStyle}>
					<TabBarItemContent
						label={label}
						iconName={icon.default}
						colorClassName="text-secondary"
					/>
				</Animated.View>
				<Animated.View style={[StyleSheet.absoluteFill, selectedStyle]}>
					<TabBarItemContent
						label={label}
						iconName={icon.selected}
						colorClassName="text-forest dark:text-white"
					/>
				</Animated.View>
			</View>
		</Pressable>
	);
}

type IndicatorTravel = {
	originX: SharedValue<number>;
	progress: SharedValue<number>;
};

export function useTabBarIndicator() {
	const x = useSharedValue(0);
	const originX = useSharedValue(0);
	const targetX = useSharedValue(0);
	const y = useSharedValue(0);
	const width = useSharedValue(0);
	const height = useSharedValue(0);

	const moveIndicatorTo = useCallback(
		(layout: LayoutRectangle) => {
			const isFirstPlacement = width.get() === 0;
			const animate = (value: number) =>
				isFirstPlacement ? value : withTiming(value, INDICATOR_TIMING);

			originX.set(x.get());
			targetX.set(layout.x);
			x.set(animate(layout.x));
			width.set(animate(layout.width));
			y.set(layout.y);
			height.set(layout.height);
		},
		[x, y, width, height, originX, targetX],
	);

	const indicatorStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: x.get() }, { translateY: y.get() }],
		width: width.get(),
		height: height.get(),
	}));

	const progress = useDerivedValue(() => {
		const distance = targetX.get() - originX.get();
		if (distance === 0) return 1;
		return Math.min(1, Math.max(0, (x.get() - originX.get()) / distance));
	});

	const indicatorTravel: IndicatorTravel = { originX, progress };

	return { moveIndicatorTo, indicatorStyle, indicatorTravel };
}

export function TabBarIndicator({
	style,
}: {
	style: ReturnType<typeof useTabBarIndicator>["indicatorStyle"];
}) {
	return (
		<Animated.View style={[{ position: "absolute" }, style]}>
			<View className="flex-1 rounded-full bg-forest-tint" />
		</Animated.View>
	);
}

export function useTabBarBottom() {
	const { bottom } = useSafeAreaInsets();
	return Math.max(bottom, MIN_BOTTOM_OFFSET);
}

export function TabBarAddButton() {
	const bottom = useTabBarBottom();

	return (
		<View
			className="absolute right-[21px] size-14 rounded-full bg-surface p-1"
			style={{ bottom, boxShadow: TAB_BAR_SHADOW }}
		>
			<Link href="/plant/new" asChild>
				<PressFeedback
					accessibilityRole="button"
					accessibilityLabel="Ajouter une plante"
					className="flex-1 items-center justify-center rounded-full bg-forest"
				>
					<Ionicons name="add" size={28} className="text-white" />
				</PressFeedback>
			</Link>
		</View>
	);
}
