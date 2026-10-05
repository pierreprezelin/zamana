import { View } from "react-native";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Pressable, { type PressableProps } from "@/components/Pressable";
import Text from "@/components/Text";

interface SettingsRowProps extends PressableProps {
	icon: IoniconsIconName;
	title: string;
	value?: string;
}

export default function SettingsRow({
	icon,
	title,
	value,
	...props
}: SettingsRowProps) {
	return (
		<Pressable
			accessibilityRole="button"
			pressedClassName=""
			pressedOpacity={0.5}
			className="flex-row items-center gap-4"
			{...props}
		>
			<Ionicons name={icon} size={24} className="text-moss" />
			<View className="flex-1">
				<Text className="font-outfit-semibold text-moss">{title}</Text>
				{value && <Text className="text-secondary">{value}</Text>}
			</View>
			<Ionicons name="chevron-forward" size={20} className="text-moss" />
		</Pressable>
	);
}
