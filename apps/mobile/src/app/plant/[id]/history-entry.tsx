import { useLocalSearchParams } from "expo-router";
import { HistoryEntryForm } from "@/features/history/components/HistoryEntryForm";
import { useEntry } from "@/features/history/useHistoryStore";
import { usePlant } from "@/features/plants/usePlantStore";

export default function PlantHistoryEntryScreen() {
	const { id, entryId } = useLocalSearchParams<{
		id: string;
		entryId?: string;
	}>();
	const plant = usePlant(id);
	const entry = useEntry(entryId);

	// The entry was just deleted and the screen is leaving, or the link does not fit:
	// a past plant's history is read-only, and an entry belongs to its own plant
	if (!plant || plant.archivedAt || (entryId && entry?.plantId !== id)) {
		return null;
	}

	return <HistoryEntryForm plantId={id} entry={entry} />;
}
