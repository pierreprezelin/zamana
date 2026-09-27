import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default function PlantHistoryEntryScreen() {
	const { id, entryId } = useLocalSearchParams<{
		id: string;
		entryId?: string;
	}>();

	return (
		<ScreenPlaceholder
			title={`Jardin #${id} - Historique - ${entryId ? `Éditer #${entryId}` : "Nouveau"}`}
		/>
	);
}
