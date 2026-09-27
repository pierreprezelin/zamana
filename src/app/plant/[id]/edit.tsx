import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default function EditPlantScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return <ScreenPlaceholder title={`Jardin - Modifier (pré-rempli) #${id}`} />;
}
