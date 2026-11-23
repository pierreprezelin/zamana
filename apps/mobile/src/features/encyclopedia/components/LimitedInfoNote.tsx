import { View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import Text from "@/components/Text";
import { t } from "@/utils/i18n";

export function LimitedInfoNote({ message = t("encyclopedia.limitedInfo") }) {
	return (
		<View className="flex-row gap-2">
			<Ionicons
				name="information-circle-outline"
				size={16}
				className="mt-0.5 text-muted"
			/>
			<Text className="flex-1 text-xs text-muted">{message}</Text>
		</View>
	);
}
