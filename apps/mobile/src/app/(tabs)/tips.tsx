import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";
import { t } from "@/utils/i18n";

export default function TipsScreen() {
	return (
		<ScreenPlaceholder
			title={t("tabs.tips")}
			showSettings
			links={[{ label: t("placeholder.article", { id: 1 }), href: "/tips/1" }]}
		/>
	);
}
