import type { ReactNode } from "react";
import { View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";

type AccordionSectionProps = {
	title: string;
	summary: string;
	expanded: boolean;
	onToggle: () => void;
	children: ReactNode;
};

export default function AccordionSection({
	title,
	summary,
	expanded,
	onToggle,
	children,
}: AccordionSectionProps) {
	return (
		<View className="overflow-hidden rounded-2xl border border-line bg-surface">
			<Pressable
				accessibilityRole="button"
				accessibilityState={{ expanded }}
				pressedClassName=""
				pressedOpacity={0.75}
				onPress={onToggle}
				className="flex-row items-center gap-3 px-4 py-3.5"
			>
				<View className="flex-1">
					<Text className="font-outfit-semibold text-base text-foreground">
						{title}
					</Text>
					<Text numberOfLines={1} className="text-xs text-muted">
						{summary}
					</Text>
				</View>
				<Ionicons
					name={expanded ? "chevron-up-outline" : "chevron-down-outline"}
					size={18}
					className="text-foreground"
				/>
			</Pressable>
			{expanded && <View className="gap-4 px-4 pb-4">{children}</View>}
		</View>
	);
}
