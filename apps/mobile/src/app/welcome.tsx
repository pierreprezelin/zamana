import { router } from "expo-router";
import { useWindowDimensions, View } from "react-native";
import Animated, {
	useAnimatedRef,
	useAnimatedScrollHandler,
	useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/Button";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Text from "@/components/Text";
import { StepsIndicator } from "@/features/onboarding/components/StepsIndicator";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";
import { t } from "@/utils/i18n";

type Step = {
	key: "intro" | "reminders" | "weather" | "done";
	icon: IoniconsIconName;
};

const steps: Step[] = [
	{ key: "intro", icon: "leaf" },
	{ key: "reminders", icon: "notifications" },
	{ key: "weather", icon: "thermometer" },
	{ key: "done", icon: "heart" },
];

const lastStep = steps.length - 1;

export default function WelcomeScreen() {
	const { width } = useWindowDimensions();
	const complete = useOnboardingStore((state) => state.complete);
	const scrollRef = useAnimatedRef<Animated.ScrollView>();
	const progress = useSharedValue(0);

	const onScroll = useAnimatedScrollHandler((event) => {
		progress.value = event.contentOffset.x / width;
	});

	const goToStep = (step: number) => {
		scrollRef.current?.scrollTo({ x: step * width, animated: true });
	};

	const insets = useSafeAreaInsets();

	const finish = (addFirstPlant: boolean) => {
		complete();
		if (addFirstPlant) router.push("/plant/new");
	};

	return (
		<View
			className="flex-1 bg-background"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			<View className="h-14 flex-row items-center justify-between px-5">
				<StepsIndicator count={steps.length} progress={progress} />
				<Button
					title={t("welcome.skip")}
					variant="ghost"
					className="-mr-2 h-8 rounded-lg px-2"
					pressedOpacity={0.5}
					hitSlop={8}
					onPress={() => finish(false)}
				/>
			</View>
			<Animated.ScrollView
				ref={scrollRef}
				horizontal
				pagingEnabled
				bounces={false}
				overScrollMode="never"
				showsHorizontalScrollIndicator={false}
				onScroll={onScroll}
			>
				{steps.map((step, index) => (
					<View key={step.key} style={{ width }} className="px-5 pb-5">
						<View className="flex-1 items-center justify-center">
							<View className="size-16 items-center justify-center rounded-full bg-primary/5">
								<Ionicons name={step.icon} size={26} className="text-primary" />
							</View>
							<Text className="mt-5 text-center font-recoleta text-[28px] leading-[1.25] text-foreground">
								{t(`welcome.${step.key}.title`)}
							</Text>
							<Text className="mt-5 px-5 text-center text-base text-muted">
								{t(`welcome.${step.key}.description`)}
							</Text>
						</View>
						<Button
							title={t(`welcome.${step.key}.action`)}
							onPress={() =>
								index === lastStep ? finish(true) : goToStep(index + 1)
							}
						/>
					</View>
				))}
			</Animated.ScrollView>
		</View>
	);
}
