import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default function TipArticleScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return <ScreenPlaceholder title={`Conseils - Article #${id}`} />;
}
