import { View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import type { Tip } from "@/features/tips/tips";
import { useTipStore } from "@/features/tips/useTipStore";
import { t } from "@/utils/i18n";

export function TipCard({ tip, today }: { tip: Tip; today: string }) {
	const dismiss = useTipStore((state) => state.dismiss);
	const title = t(`tips.items.${tip.id}.title`);
	const body = t(`tips.items.${tip.id}.body`);

	return (
		<View className="flex-row items-start gap-4 rounded-2xl bg-highlight p-4">
			<View className="size-12 items-center justify-center rounded-3xl bg-on-primary/25">
				<Ionicons
					name={tip.kind === "protip" ? "bulb-outline" : "sparkles-outline"}
					size={24}
					className="text-on-primary"
				/>
			</View>
			<View
				className="flex-1 gap-0.5"
				accessible
				accessibilityLabel={`${t(`tips.card.${tip.kind}`)}. ${title}. ${body}`}
			>
				<Text className="font-outfit-semibold text-base text-on-primary">
					{title}
				</Text>
				<Text className="text-sm text-on-primary/80">{body}</Text>
			</View>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={t("common.close")}
				pressedClassName=""
				pressedOpacity={0.5}
				hitSlop={12}
				onPress={() => dismiss(today)}
			>
				<Ionicons name="close" size={20} className="text-on-primary" />
			</Pressable>
		</View>
	);
}
