import { Stack, useLocalSearchParams } from "expo-router";
import {
	type PrefillParams,
	plantPrefill,
} from "@/features/encyclopedia/plantPrefill";
import { PlantForm } from "@/features/plants/components/PlantForm";
import { duplicateFormState } from "@/features/plants/plantForm";
import { usePlant } from "@/features/plants/usePlantStore";
import { t } from "@/utils/i18n";

type NewPlantParams = PrefillParams & { from?: string };

export default function NewPlantScreen() {
	const { from, ...params } = useLocalSearchParams<NewPlantParams>();
	// An unknown id, like a deleted plant, falls back to the other prefills
	const source = usePlant(typeof from === "string" ? from : "");

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
						: plantPrefill(params)
				}
			/>
		</>
	);
}
