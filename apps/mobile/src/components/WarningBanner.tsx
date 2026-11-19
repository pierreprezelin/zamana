import type { ReactNode } from "react";
import { View } from "react-native";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Text from "@/components/Text";

type WarningBannerProps = {
	icon: IoniconsIconName;
	message: string;
	action?: ReactNode;
};

export default function WarningBanner({
	icon,
	message,
	action,
}: WarningBannerProps) {
	return (
		<View className="gap-3 rounded-2xl border border-warning bg-warning-tint p-4">
			<View className="flex-row items-center gap-3">
				<Ionicons name={icon} size={20} className="text-warning" />
				<Text className="flex-1 font-outfit-semibold text-warning">
					{message}
				</Text>
			</View>
			{action}
		</View>
	);
}
