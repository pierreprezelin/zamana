import { router } from "expo-router";
import { HeaderIconButton } from "@/components/HeaderIconButton";

export function HeaderBackButton() {
	return (
		<HeaderIconButton
			icon="arrow-back"
			accessibilityLabel="Retour"
			onPress={() => router.back()}
		/>
	);
}
