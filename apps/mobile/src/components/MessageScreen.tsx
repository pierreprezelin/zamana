import { View } from "react-native";
import Button from "@/components/Button";
import type { IoniconsIconName } from "@/components/ionicons";
import Text from "@/components/Text";

type MessageScreenProps = {
	title: string;
	text: string;
	action: { title: string; icon?: IoniconsIconName; onPress: () => void };
};

export function MessageScreen({ title, text, action }: MessageScreenProps) {
	return (
		<View className="flex-1 items-center justify-center gap-4 bg-background p-6">
			<Text className="text-center font-recoleta text-2xl text-foreground">
				{title}
			</Text>
			<Text className="text-center text-muted">{text}</Text>
			<Button variant="ghost" {...action} />
		</View>
	);
}
