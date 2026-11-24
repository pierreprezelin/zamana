import { nativeApplicationVersion } from "expo-application";
import { Link, router } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SettingsRow from "@/components/SettingsRow";
import Text from "@/components/Text";
import { LanguageSetting } from "@/features/language/components/LanguageSetting";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";
import { ThemeSelector } from "@/features/theme/components/ThemeSelector";
import { UserNameSetting } from "@/features/user/components/UserNameSetting";
import { t } from "@/utils/i18n";

export default function SettingsScreen() {
	const insets = useSafeAreaInsets();

	return (
		<View
			className="flex-1 gap-6 p-4"
			style={{ paddingBottom: insets.bottom + 16 }}
		>
			<ThemeSelector />
			<View>
				<UserNameSetting />
				<Link href="/settings/notifications" asChild>
					<SettingsRow
						icon="notifications-outline"
						title={t("screens.notifications")}
						value={t("settings.summaries.notifications")}
					/>
				</Link>
				<Link href="/settings/location" asChild>
					<SettingsRow
						icon="earth-outline"
						title={t("screens.location")}
						value={t("settings.summaries.location")}
					/>
				</Link>
				<Link href="/settings/home" asChild>
					<SettingsRow
						icon="home-outline"
						title={t("screens.home")}
						value={t("settings.summaries.home")}
					/>
				</Link>
				<Link href="/settings/ergonomics" asChild>
					<SettingsRow
						icon="hand-left-outline"
						title={t("screens.ergonomics")}
						value={t("settings.summaries.ergonomics")}
					/>
				</Link>
				<LanguageSetting />
				<SettingsRow
					icon="refresh-outline"
					title={t("settings.restartOnboarding")}
					onPress={() => {
						useOnboardingStore.setState({ completed: false });
						router.replace("/welcome");
					}}
				/>
			</View>
			<Text className="mt-auto text-center text-xs text-foreground opacity-50">
				v{nativeApplicationVersion}b
			</Text>
		</View>
	);
}
