import type { Plant } from "@/features/plants/plantSchema";

const FEATURED_FOR_MS = 24 * 60 * 60 * 1000;

type NewPlantContext = {
	plants: Plant[];
	dismissedUpTo: string | null;
	now: Date;
};

export const newPlantToFeature = ({
	plants,
	dismissedUpTo,
	now,
}: NewPlantContext) => {
	const latest = plants
		.filter((plant) => !plant.archivedAt)
		.reduce<Plant | null>(
			(found, plant) =>
				!found || plant.createdAt > found.createdAt ? plant : found,
			null,
		);
	if (!latest) return null;
	const isFresh =
		now.getTime() - new Date(latest.createdAt).getTime() < FEATURED_FOR_MS;
	const isDismissed =
		dismissedUpTo !== null && dismissedUpTo >= latest.createdAt;
	return isFresh && !isDismissed ? latest : null;
};
