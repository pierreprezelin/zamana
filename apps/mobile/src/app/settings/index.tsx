import { nativeApplicationVersion } from "expo-application";
import { Link } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SettingsRow from "@/components/SettingsRow";
import Text from "@/components/Text";
import { ThemeSelector } from "@/features/theme/components/ThemeSelector";
import { UserNameSetting } from "@/features/user/components/UserNameSetting";

export default function SettingsScreen() {
	const insets = useSafeAreaInsets();

	return (
		<View
			className="flex-1 gap-6 p-5"
			style={{ paddingBottom: insets.bottom + 20 }}
		>
			<ThemeSelector />
			<View className="gap-4">
				<Link href="/settings/notifications" asChild>
					<SettingsRow icon="notifications-outline" title="Notifications" />
				</Link>
				<UserNameSetting />
			</View>
			<Text className="mt-auto text-center text-xs text-moss opacity-50">
				v{nativeApplicationVersion}
			</Text>
		</View>
	);
}
