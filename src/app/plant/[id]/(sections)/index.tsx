import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default function PlantInformationScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return (
		<ScreenPlaceholder
			title="Informations"
			links={[
				{ label: "Modifier les informations", href: `/plant/${id}/edit` },
			]}
		/>
	);
}
