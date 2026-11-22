import { newPlantToFeature } from "@/features/plants/newPlant";
import { useNewPlantStore } from "@/features/plants/useNewPlantStore";
import { usePlantStore } from "@/features/plants/usePlantStore";

export function useNewPlantToFeature() {
	const plants = usePlantStore((state) => state.plants);
	const enabled = useNewPlantStore((state) => state.enabled);
	const dismissedUpTo = useNewPlantStore((state) => state.dismissedUpTo);

	if (!enabled) return null;
	return newPlantToFeature({ plants, dismissedUpTo, now: new Date() });
}
