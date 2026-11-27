import { Stack, useLocalSearchParams } from "expo-router";
import {
	type PrefillParams,
	plantPrefill,
	withIdentifiedPhoto,
} from "@/features/encyclopedia/plantPrefill";
import {
	identifiedPhotoFor,
	useIdentifiedPhotoStore,
} from "@/features/identification/useIdentifiedPhotoStore";
import { PlantForm } from "@/features/plants/components/PlantForm";
import { duplicateFormState } from "@/features/plants/plantForm";
import { usePlant } from "@/features/plants/usePlantStore";
import { t } from "@/utils/i18n";

type NewPlantParams = PrefillParams & { from?: string };

export default function NewPlantScreen() {
	const { from, ...params } = useLocalSearchParams<NewPlantParams>();
	// An unknown id, like a deleted plant, falls back to the other prefills
	const source = usePlant(typeof from === "string" ? from : "");
	const identifiedPhoto = useIdentifiedPhotoStore((state) =>
		identifiedPhotoFor(
			typeof params.scientificName === "string"
				? params.scientificName
				: undefined,
			state,
		),
	);

	return (
		<>
			{source && (
				<Stack.Screen options={{ title: t("screens.duplicatePlant") }} />
			)}
			<PlantForm
				prefill={
					source
						? {
								values: duplicateFormState(source, new Date()),
								isPartial: false,
							}
						: withIdentifiedPhoto(plantPrefill(params), identifiedPhoto)
				}
			/>
		</>
	);
}
