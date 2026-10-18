import {
	locationLabel,
	originLabel,
	plantTypeLabel,
} from "@/features/plants/plantOptions";
import type { Plant } from "@/features/plants/plantSchema";
import { t } from "@/utils/i18n";

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

// The translated labels are searched, the stored values being keys like "kitchen"
const searchableTexts = (plant: SearchablePlant) => [
	plant.nickname,
	plant.name,
	plant.scientificName,
	plant.type && plantTypeLabel(plant.type),
	plant.origin && originLabel(plant.origin),
	plant.outdoor
		? t("plant.outdoor")
		: plant.location && locationLabel(plant.location),
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
