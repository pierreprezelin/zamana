import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ToggleRow from "@/components/ToggleRow";
import { useNewPlantStore } from "@/features/plants/useNewPlantStore";
import { TipsPreferences } from "@/features/tips/components/TipsPreferences";
import { t } from "@/utils/i18n";

export default function HomeSettingsScreen() {
	const { bottom } = useSafeAreaInsets();
	const newPlantEnabled = useNewPlantStore((state) => state.enabled);
	const setNewPlantEnabled = useNewPlantStore((state) => state.setEnabled);

	return (
		<View className="flex-1 gap-6 p-4" style={{ paddingBottom: bottom + 16 }}>
			<ToggleRow
				label={t("plant.newPlantCard.show")}
				helper={t("plant.newPlantCard.showHelper")}
				value={newPlantEnabled}
				onChange={setNewPlantEnabled}
			/>
			<TipsPreferences />
		</View>
	);
}
