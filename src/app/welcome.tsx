import { router } from "expo-router";
import { useWindowDimensions, View } from "react-native";
import Animated, {
	useAnimatedRef,
	useAnimatedScrollHandler,
	useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "@/components/Button";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Text from "@/components/Text";
import { StepsIndicator } from "@/features/onboarding/components/StepsIndicator";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";

type Step = {
	icon: IoniconsIconName;
	title: string;
	description: string;
	action: string;
};

const steps: Step[] = [
	{
		icon: "leaf",
		title: "Bienvenue sur Zamana !",
		description: "Un pense-bête pour vous aider à vous occuper de vos plantes.",
		action: "Configurer l’application",
	},
	{
		icon: "notifications",
		title: "Recevez des rappels",
		description:
			"N’oubliez plus d’arroser vos plantes, avec des notifications dédiées.",
		action: "Autoriser les notifications",
	},
	{
		icon: "thermometer",
		title: "Recevez des alertes météo",
		description:
			"Rentrez vos plantes à l’intérieur si le temps est anormalement froid ou chaud.",
		action: "Autoriser la localisation",
	},
	{
		icon: "heart",
		title: "C’est tout !",
		description:
			"Votre jardin vous attend, ainsi que d’autres ressources utiles à son entretien.",
		action: "Ajouter ma première plante",
	},
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

	const finish = (addFirstPlant: boolean) => {
		complete();
		if (addFirstPlant) router.push("/plant/new");
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="h-14 flex-row items-center justify-between px-5">
				<StepsIndicator count={steps.length} progress={progress} />
				<Button
					title="Passer"
					variant="ghost"
					className="-mr-2 h-8 rounded-[8px] px-2"
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
					<View key={step.title} style={{ width }} className="px-5 pb-5">
						<View className="flex-1 items-center justify-center">
							<View className="size-16 items-center justify-center rounded-full bg-forest/5">
								<Ionicons name={step.icon} size={26} className="text-forest" />
							</View>
							<Text className="mt-5 text-center font-recoleta text-[28px] leading-[1.25] text-moss">
								{step.title}
							</Text>
							<Text className="mt-5 px-5 text-center text-[16px] text-secondary">
								{step.description}
							</Text>
						</View>
						<Button
							title={step.action}
							onPress={() =>
								index === lastStep ? finish(true) : goToStep(index + 1)
							}
						/>
					</View>
				))}
			</Animated.ScrollView>
		</SafeAreaView>
	);
}
