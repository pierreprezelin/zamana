import { router } from "expo-router";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";

export function HeaderBackButton() {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel="Retour"
			pressedOpacity={0.5}
			hitSlop={8}
			onPress={() => router.back()}
			className="size-10 items-center justify-center rounded-full"
		>
			<Ionicons name="arrow-back" size={24} className="text-moss" />
		</Pressable>
	);
}
