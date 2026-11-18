import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ClimateSelector } from "@/features/care/components/CarePreferences";

export default function LocationSettingsScreen() {
	const { bottom } = useSafeAreaInsets();

	return (
		<View className="flex-1 gap-6 p-4" style={{ paddingBottom: bottom + 16 }}>
			<ClimateSelector />
		</View>
	);
}
