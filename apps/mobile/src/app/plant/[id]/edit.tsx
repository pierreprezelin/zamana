import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

export default function EditPlantScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return <ScreenPlaceholder title={`Jardin - Modifier (pré-rempli) #${id}`} />;
}
