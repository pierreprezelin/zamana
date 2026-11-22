import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";
import { t } from "@/utils/i18n";

export default function EncyclopediaScreen() {
	return (
		<ScreenPlaceholder
			title={t("tabs.encyclopedia")}
			showSettings
			links={[
				{ label: t("placeholder.result", { id: 1 }), href: "/encyclopedia/1" },
			]}
		/>
	);
}
