import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default function EncyclopediaResultScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return (
		<ScreenPlaceholder
			title={`Encyclopédie - Résultat #${id}`}
			links={[{ label: "Ajouter à mon jardin", href: "/plant/new" }]}
		/>
	);
}
