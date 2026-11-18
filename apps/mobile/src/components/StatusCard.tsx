import type { ReactNode } from "react";
import { View } from "react-native";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Text from "@/components/Text";

type StatusCardProps = {
	icon: IoniconsIconName;
	title: string;
	description?: string;
	children?: ReactNode;
};

export default function StatusCard({
	icon,
	title,
	description,
	children,
}: StatusCardProps) {
	return (
		<View className="items-center gap-2 rounded-2xl border border-line bg-surface p-6">
			<View className="size-12 items-center justify-center rounded-full bg-primary-tint">
				<Ionicons name={icon} size={24} className="text-primary" />
			</View>
			<Text className="text-center font-outfit-semibold text-base text-foreground">
				{title}
			</Text>
			{description && (
				<Text className="text-center text-muted">{description}</Text>
			)}
			{children}
		</View>
	);
}
