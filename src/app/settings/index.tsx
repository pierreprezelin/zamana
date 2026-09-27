import { Link } from "expo-router";
import { View } from "react-native";
import SettingsRow from "@/components/SettingsRow";
import { ThemeSelector } from "@/features/theme/components/ThemeSelector";
import { UserNameSetting } from "@/features/user/components/UserNameSetting";

export default function SettingsScreen() {
	return (
		<View className="flex-1 gap-6 p-5">
			<ThemeSelector />
			<View className="gap-4">
				<Link href="/settings/notifications" asChild>
					<SettingsRow icon="notifications-outline" title="Notifications" />
				</Link>
				<UserNameSetting />
			</View>
		</View>
	);
}
