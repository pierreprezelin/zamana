import { Linking, View } from "react-native";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { t } from "@/utils/i18n";

const OPEN_METEO_URL = "https://open-meteo.com/";
const GEONAMES_URL = "https://www.geonames.org/";

type CreditLinkProps = { label: string; url: string; textClassName?: string };

function CreditLink({
	label,
	url,
	textClassName = "text-muted",
}: CreditLinkProps) {
	return (
		<Pressable
			accessibilityRole="link"
			pressedClassName=""
			pressedOpacity={0.5}
			hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
			onPress={() => Linking.openURL(url)}
		>
			<Text className={`text-xs underline ${textClassName}`}>{label}</Text>
		</Pressable>
	);
}

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
