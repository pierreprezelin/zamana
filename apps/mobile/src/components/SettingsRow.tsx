import { Linking, View } from "react-native";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Pressable, { type PressableProps } from "@/components/Pressable";
import Text from "@/components/Text";

interface SettingsRowProps extends PressableProps {
	icon: IoniconsIconName;
	title: string;
	value?: string;
	url?: string;
	/** A row opening a sheet or running an action has no chevron, as on iOS and Android */
	navigates?: boolean;
}

export default function SettingsRow({
	icon,
	title,
	value,
	url,
	navigates = true,
	...props
}: SettingsRowProps) {
	const accessory = url ? "open-outline" : navigates && "chevron-forward";

	return (
		<Pressable
			accessibilityRole={url ? "link" : "button"}
			pressedOpacity={0.5}
			className="flex-row items-center gap-4 py-3"
			onPress={url ? () => Linking.openURL(url) : undefined}
			{...props}
		>
			<Ionicons name={icon} size={24} className="text-foreground" />
			<View className="flex-1">
				<Text className="font-outfit-semibold text-foreground">{title}</Text>
				{value && <Text className="text-muted">{value}</Text>}
			</View>
			{accessory && (
				<Ionicons name={accessory} size={20} className="text-foreground" />
			)}
		</Pressable>
	);
}
