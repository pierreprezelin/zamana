import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ClimateSelector } from "@/features/care/components/CarePreferences";
import { WeatherCredits } from "@/features/weather/components/OpenMeteoCredit";
import { WeatherPlaceSettings } from "@/features/weather/components/WeatherPlaceSettings";

export default function LocationSettingsScreen() {
	const { bottom } = useSafeAreaInsets();

	return (
		<View className="flex-1">
			<ScrollView
				contentContainerClassName="gap-6 p-4"
				keyboardShouldPersistTaps="handled"
			>
				<WeatherPlaceSettings />
				<ClimateSelector />
			</ScrollView>
			{/* Always in sight, as the licences of both sources ask */}
			<View className="px-4 pt-3" style={{ paddingBottom: bottom + 16 }}>
				<WeatherCredits />
			</View>
		</View>
	);
}
