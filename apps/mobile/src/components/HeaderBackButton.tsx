import { router } from "expo-router";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import { t } from "@/utils/i18n";

export function HeaderBackButton() {
	return (
		<HeaderIconButton
			// The 40px box and the glyph's own side bearing push the arrow past the 16px gutter
			className="-ml-3"
			icon="arrow-back"
			accessibilityLabel={t("common.back")}
			onPress={() => router.back()}
		/>
	);
}
