import { useLocalSearchParams } from "expo-router";
import { PlantForm } from "@/features/plants/components/PlantForm";
import { usePlant } from "@/features/plants/usePlantStore";

export default function EditPlantScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const plant = usePlant(id);

	// The plant was just deleted, the screen is being dismissed
	if (!plant) return null;

	return <PlantForm plant={plant} />;
}
