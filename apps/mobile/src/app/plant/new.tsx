import { useLocalSearchParams } from "expo-router";
import {
	type PrefillParams,
	plantPrefill,
} from "@/features/encyclopedia/plantPrefill";
import { PlantForm } from "@/features/plants/components/PlantForm";

export default function NewPlantScreen() {
	const params = useLocalSearchParams<PrefillParams>();

	return <PlantForm prefill={plantPrefill(params)} />;
}
