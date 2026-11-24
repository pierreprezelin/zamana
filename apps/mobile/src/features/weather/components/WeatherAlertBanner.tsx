import { router } from "expo-router";
import { View } from "react-native";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { displayName } from "@/features/plants/plantLabels";
import { OpenMeteoCredit } from "@/features/weather/components/OpenMeteoCredit";
import type { WeatherAlert } from "@/features/weather/useWeatherAlert";
import { placeShortName, riskParts } from "@/features/weather/weatherLabels";
import type { WeatherRiskKind } from "@/features/weather/weatherRisks";
import { toISODate } from "@/utils/dates";
import { t } from "@/utils/i18n";

const RISK_ICONS: Record<WeatherRiskKind, IoniconsIconName> = {
	cold: "snow-outline",
	heat: "thermometer-outline",
	storm: "thunderstorm-outline",
	wind: "flag-outline",
};

export function WeatherAlertBanner({
	alert: { place, risks },
}: {
	alert: WeatherAlert;
}) {
	const today = toISODate(new Date());
	const alertedPlants = [
		...new Map(
			risks.flatMap((risk) => risk.plants).map((plant) => [plant.id, plant]),
		).values(),
	];

	return (
		<View className="gap-2">
			<View className="flex-row items-start gap-4 rounded-2xl bg-danger-strong p-4">
				<View className="size-12 items-center justify-center rounded-3xl bg-on-primary/25">
					<Ionicons
						name={RISK_ICONS[risks[0]?.kind ?? "cold"]}
						size={24}
						className="text-on-primary"
					/>
				</View>
				<View className="flex-1 gap-0.5">
					<Text className="font-outfit-semibold text-base text-on-primary">
						{t("weather.banner.title", { place: placeShortName(place.name) })}
					</Text>
					{risks.map((risk) => {
						const { summary, advice } = riskParts(risk, today);
						return (
							<View key={risk.kind}>
								<Text className="text-sm text-on-primary/80">
									{summary} {advice}
								</Text>
							</View>
						);
					})}
					<View className="mt-1">
						<OpenMeteoCredit textClassName="text-on-primary/60" />
					</View>
				</View>
			</View>
			{/* Brought in for the season, a plant is no longer outdoors: its sheet stops the alerts */}
			<View className="flex-row flex-wrap items-center gap-x-1.5 gap-y-1">
				<Ionicons
					name="information-circle-outline"
					size={14}
					className="text-muted"
				/>
				<Text className="text-xs text-muted">
					{t("weather.banner.seasonQuestion")}
				</Text>
				{alertedPlants.map((plant) => (
					<Pressable
						key={plant.id}
						accessibilityRole="link"
						pressedOpacity={0.5}
						hitSlop={8}
						onPress={() => router.push(`/plant/${plant.id}/edit?section=needs`)}
					>
						<Text className="font-outfit-semibold text-xs text-foreground underline">
							{t("weather.banner.editPlant", { name: displayName(plant) })}
						</Text>
					</Pressable>
				))}
			</View>
		</View>
	);
}
