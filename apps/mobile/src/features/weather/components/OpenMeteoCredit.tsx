import { View } from "react-native";
import CreditLink from "@/components/CreditLink";
import Text from "@/components/Text";
import { t } from "@/utils/i18n";

const OPEN_METEO_URL = "https://open-meteo.com/";
const GEONAMES_URL = "https://www.geonames.org/";

// Required by the CC BY 4.0 licence next to any Open-Meteo data
export function OpenMeteoCredit({ textClassName }: { textClassName?: string }) {
	return (
		<View className="self-start">
			<CreditLink
				label={t("weather.credit")}
				url={OPEN_METEO_URL}
				textClassName={textClassName}
			/>
		</View>
	);
}

// Both sources of the location settings, required by their CC BY licences
export function WeatherCredits() {
	return (
		<View className="flex-row items-center justify-center gap-1.5">
			<CreditLink label={t("weather.credit")} url={OPEN_METEO_URL} />
			<Text className="text-xs text-muted">·</Text>
			<CreditLink label={t("weather.geonamesCredit")} url={GEONAMES_URL} />
		</View>
	);
}
