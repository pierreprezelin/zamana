import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";
import { t } from "@/utils/i18n";

export default function EncyclopediaResultScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return (
		<ScreenPlaceholder
			title={t("placeholder.result", { id })}
			links={[{ label: t("placeholder.addToGarden"), href: "/plant/new" }]}
		/>
	);
}
