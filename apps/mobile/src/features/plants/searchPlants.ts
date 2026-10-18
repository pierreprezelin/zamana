import {
	locationLabels,
	originLabels,
	plantTypeLabels,
} from "@/features/plants/plantOptions";
import type { Plant } from "@/features/plants/plantSchema";

type SearchablePlant = Pick<
	Plant,
	| "nickname"
	| "name"
	| "scientificName"
	| "type"
	| "origin"
	| "location"
	| "outdoor"
>;

const normalize = (text: string) =>
	text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// The French labels are searched, the stored values being keys like "kitchen"
const searchableTexts = (plant: SearchablePlant) => [
	plant.nickname,
	plant.name,
	plant.scientificName,
	plant.type && plantTypeLabels[plant.type],
	plant.origin && originLabels[plant.origin],
	plant.outdoor
		? "Extérieur"
		: plant.location && locationLabels[plant.location],
];

export const searchPlants = <T extends SearchablePlant>(
	plants: T[],
	query: string,
) => {
	const needle = normalize(query.trim());
	if (!needle) return plants;

	return plants.filter((plant) =>
		searchableTexts(plant).some(
			(text) => text && normalize(text).includes(needle),
		),
	);
};
