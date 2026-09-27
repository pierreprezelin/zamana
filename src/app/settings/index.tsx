import { Link } from "expo-router";
import { View } from "react-native";
import Text from "@/components/Text";
import { ThemeSelector } from "@/features/theme/components/ThemeSelector";

export default function SettingsScreen() {
	return (
		<View className="flex-1 gap-6 p-5">
			<ThemeSelector />
			<Link href="/settings/notifications" asChild>
				<Text className="text-forest">→ Notifications</Text>
			</Link>
		</View>
	);
}
