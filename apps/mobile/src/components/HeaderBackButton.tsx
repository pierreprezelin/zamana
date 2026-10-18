import { router } from "expo-router";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import { t } from "@/utils/i18n";

export function HeaderBackButton() {
	return (
		<HeaderIconButton
			icon="arrow-back"
			accessibilityLabel={t("common.back")}
			onPress={() => router.back()}
		/>
	);
}
