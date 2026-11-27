import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CreditLink from "@/components/CreditLink";
import SettingsRow from "@/components/SettingsRow";
import Text from "@/components/Text";
import { PLANTNET_URL } from "@/features/identification/plantnet";
import { WeatherCredits } from "@/features/weather/components/OpenMeteoCredit";
import { locale, t } from "@/utils/i18n";

const REPOSITORY_URL = "https://github.com/pierreprezelin/zamana";
const SITE_URL = "https://zamana.garden";
const INATURALIST_URL = "https://www.inaturalist.org/";

export default function AboutScreen() {
	const { bottom } = useSafeAreaInsets();
	const privacyUrl = `${SITE_URL}${locale() === "fr" ? "/confidentialite/" : "/en/privacy/"}`;

	return (
		<ScrollView
			contentContainerClassName="grow gap-6 p-4"
			contentContainerStyle={{ paddingBottom: bottom + 16 }}
		>
			<View className="gap-3">
				<Text className="font-recoleta text-card-title text-foreground">
					{t("about.story.title")}
				</Text>
				<Text className="text-muted">{t("about.story.tree")}</Text>
				<Text className="text-muted">{t("about.story.tribute")}</Text>
			</View>
			<View className="gap-3">
				<Text className="font-recoleta text-card-title text-foreground">
					{t("about.openSource.title")}
				</Text>
				<Text className="text-muted">{t("about.openSource.license")}</Text>
				<View>
					<SettingsRow
						icon="logo-github"
						title={t("about.openSource.repository")}
						url={REPOSITORY_URL}
					/>
					<SettingsRow
						icon="globe-outline"
						title={t("about.links.site")}
						url={SITE_URL}
					/>
					<SettingsRow
						icon="shield-checkmark-outline"
						title={t("about.links.privacy")}
						url={privacyUrl}
					/>
				</View>
			</View>
			<View className="mt-auto items-center gap-2">
				<CreditLink
					label={t("about.inaturalistCredit")}
					url={INATURALIST_URL}
				/>
				<CreditLink label={t("about.plantnetCredit")} url={PLANTNET_URL} />
				<WeatherCredits />
			</View>
		</ScrollView>
	);
}
