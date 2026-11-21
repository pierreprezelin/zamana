import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TipsPreferences } from "@/features/tips/components/TipsPreferences";

export default function HomeSettingsScreen() {
	const { bottom } = useSafeAreaInsets();

	return (
		<View className="flex-1 gap-6 p-4" style={{ paddingBottom: bottom + 16 }}>
			<TipsPreferences />
		</View>
	);
}
