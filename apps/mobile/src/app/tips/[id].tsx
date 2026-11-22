import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";
import { t } from "@/utils/i18n";

export default function TipArticleScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return <ScreenPlaceholder title={t("placeholder.article", { id })} />;
}
