import { View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import Text from "@/components/Text";
import { t } from "@/utils/i18n";

export function LimitedInfoNote({ message = t("encyclopedia.limitedInfo") }) {
	return (
		<View className="flex-row gap-3 rounded-2xl border border-info bg-info-tint p-4">
			<Ionicons name="information-circle" size={20} className="text-info" />
			<Text className="flex-1 font-outfit-semibold text-info">{message}</Text>
		</View>
	);
}
