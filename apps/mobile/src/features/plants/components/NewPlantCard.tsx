import { View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { newPlantToFeature } from "@/features/plants/newPlant";
import { displayName } from "@/features/plants/plantLabels";
import { useNewPlantStore } from "@/features/plants/useNewPlantStore";
import { usePlantStore } from "@/features/plants/usePlantStore";
import { t } from "@/utils/i18n";

export function NewPlantCard() {
	const plants = usePlantStore((state) => state.plants);
	const enabled = useNewPlantStore((state) => state.enabled);
	const dismissedUpTo = useNewPlantStore((state) => state.dismissedUpTo);

	const plant = newPlantToFeature({ plants, dismissedUpTo, now: new Date() });
	if (!enabled || !plant) return null;
	const title = t("plant.newPlantCard.title");
	const description = t("plant.newPlantCard.description", {
		name: displayName(plant),
	});

	return (
		<View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-4">
			<View className="size-9 items-center justify-center rounded-xl bg-primary-tint">
				<Ionicons name="leaf-outline" size={18} className="text-primary" />
			</View>
			<View
				className="flex-1"
				accessible
				accessibilityLabel={`${title}. ${description}`}
			>
				<Text className="font-outfit-semibold text-foreground">{title}</Text>
				<Text className="text-xs text-muted">{description}</Text>
			</View>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={t("common.close")}
				pressedClassName=""
				pressedOpacity={0.5}
				hitSlop={12}
				className="self-start"
				onPress={() => useNewPlantStore.getState().dismiss(plant.createdAt)}
			>
				<Ionicons name="close" size={20} className="text-muted" />
			</Pressable>
		</View>
	);
}
