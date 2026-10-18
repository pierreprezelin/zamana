import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import type { Ref } from "react";
import { View } from "react-native";
import BottomSheet from "@/components/BottomSheet";
import Text from "@/components/Text";
import type { Help } from "@/features/plants/plantOptions";

type HelpSheetProps = {
	ref: Ref<BottomSheetModal>;
	help: Help;
};

export function HelpSheet({ ref, help }: HelpSheetProps) {
	return (
		<BottomSheet ref={ref} title={help.title}>
			<View className="gap-4">
				{help.items.map((item) => (
					<View key={item.label}>
						<Text className="font-outfit-semibold text-base text-foreground">
							{item.label}
						</Text>
						<Text className="text-muted">{item.text}</Text>
					</View>
				))}
			</View>
		</BottomSheet>
	);
}
