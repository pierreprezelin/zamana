import { useEffect } from "react";
import { View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import type { Climate } from "@/features/care/careTypes";
import { useTipStore, visibleTip } from "@/features/tips/useTipStore";
import { t } from "@/utils/i18n";

type TipCardProps = { today: string; climate: Climate };

export function TipCard({ today, climate }: TipCardProps) {
	const enabled = useTipStore((state) => state.enabled);
	const todayTip = useTipStore((state) => state.todayTip);
	const dismissedOn = useTipStore((state) => state.dismissedOn);
	const pickTodayTip = useTipStore((state) => state.pickTodayTip);
	const dismiss = useTipStore((state) => state.dismiss);

	// Also runs after a reset from the settings, which clears today's tip
	useEffect(() => {
		if (enabled && todayTip?.date !== today) pickTodayTip(today, climate);
	}, [enabled, todayTip, today, climate, pickTodayTip]);

	const tip = visibleTip({ enabled, todayTip, dismissedOn }, today);
	if (!tip) return null;
	const title = t(`tips.items.${tip.id}.title`);
	const body = t(`tips.items.${tip.id}.body`);

	return (
		<View className="flex-row items-center gap-4 rounded-2xl bg-highlight p-4">
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
