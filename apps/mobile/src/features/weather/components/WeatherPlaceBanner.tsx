import { router } from "expo-router";
import { View } from "react-native";
import Button from "@/components/Button";
import { Ionicons } from "@/components/ionicons";
import Text from "@/components/Text";
import { usePlantStore } from "@/features/plants/usePlantStore";
import { useWeatherStore } from "@/features/weather/useWeatherStore";
import { needsWeatherPlace } from "@/features/weather/weatherRisks";
import { t } from "@/utils/i18n";

// Outdoor plants with no place get no alert: says so until a place is chosen
export function WeatherPlaceBanner() {
	const plants = usePlantStore((state) => state.plants);
	const alertsEnabled = useWeatherStore((state) => state.alertsEnabled);
	const place = useWeatherStore((state) => state.place);

	if (!needsWeatherPlace({ alertsEnabled, place, plants })) return null;

	return (
		<View className="gap-3 rounded-2xl border border-line bg-surface p-4">
			<View className="flex-row items-start gap-3">
				<View className="size-9 items-center justify-center rounded-xl bg-primary-tint">
					<Ionicons
						name="location-outline"
						size={18}
						className="text-primary"
					/>
				</View>
				<View className="flex-1">
					<Text className="font-outfit-semibold text-foreground">
						{t("weather.placeMissing.title")}
					</Text>
					<Text className="text-xs text-muted">
						{t("weather.placeMissing.description")}
					</Text>
				</View>
			</View>
			<Button
				title={t("weather.placeMissing.action")}
				className="h-9"
				onPress={() => router.push("/settings/location")}
			/>
		</View>
	);
}
