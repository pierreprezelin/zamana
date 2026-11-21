import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SwipeSelector } from "@/features/care/components/CarePreferences";
import { TipsPreferences } from "@/features/tips/components/TipsPreferences";

export default function ErgonomicsSettingsScreen() {
	const { bottom } = useSafeAreaInsets();

	return (
		<View className="flex-1 gap-6 p-4" style={{ paddingBottom: bottom + 16 }}>
			<SwipeSelector />
			<TipsPreferences />
		</View>
	);
}
