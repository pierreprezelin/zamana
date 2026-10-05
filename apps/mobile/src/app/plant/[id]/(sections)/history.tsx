import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

export default function PlantHistoryScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return (
		<ScreenPlaceholder
			title="Historique"
			links={[
				{ label: "Nouvelle entrée", href: `/plant/${id}/history-entry` },
				{
					label: "Éditer l'entrée #1",
					href: `/plant/${id}/history-entry?entryId=1`,
				},
			]}
		/>
	);
}
