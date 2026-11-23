import {
	CATEGORIES,
	CURATED_PLANTS,
	categoryTaxonIds,
	curatedPlant,
} from "@/features/encyclopedia/curatedPlants";
import { plantInputSchema } from "@/features/plants/plantSchema";

const plantsOf = (category: (typeof CATEGORIES)[number]) =>
	categoryTaxonIds(category).map((taxonId) => curatedPlant(taxonId));

describe("curatedPlants", () => {
	it("holds the 60 most common houseplants", () => {
		expect(CURATED_PLANTS).toHaveLength(60);
	});

	it("lists each plant once", () => {
		const ids = CURATED_PLANTS.map((plant) => plant.taxonId);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("only holds values a plant form accepts", () => {
		for (const { taxonId, ...plant } of CURATED_PLANTS) {
			const result = plantInputSchema.safeParse({
				...plant,
				photo: null,
				photoCredit: null,
				nickname: "",
				name: "Plante",
				scientificName: "",
				origin: null,
				acquiredAt: null,
				location: null,
				age: null,
				notes: "",
			});
			expect({ taxonId, success: result.success }).toEqual({
				taxonId,
				success: true,
			});
		}
	});

	it.each(CATEGORIES)("shows 10 plants in the %s tab", (category) => {
		expect(categoryTaxonIds(category)).toHaveLength(10);
	});

	it("shows the 10 most common plants in the popular tab", () => {
		expect(categoryTaxonIds("popular")).toEqual(
			CURATED_PLANTS.slice(0, 10).map((plant) => plant.taxonId),
		);
	});

	it("keeps each tab to the plants matching its need", () => {
		expect(plantsOf("nonToxic").every((plant) => !plant?.toxic)).toBe(true);
		expect(plantsOf("lowLight").every((plant) => plant?.light === 1)).toBe(
			true,
		);
		expect(
			plantsOf("lowWatering").every((plant) => plant?.watering === 3),
		).toBe(true);
		expect(
			plantsOf("flowering").every(
				(plant) => (plant?.floweringSeasons.length ?? 0) > 0,
			),
		).toBe(true);
		expect(
			plantsOf("succulents").every(
				(plant) => plant?.type === "succulent" || plant?.type === "cactus",
			),
		).toBe(true);
	});

	it("finds no care data for a plant outside the list", () => {
		expect(curatedPlant(-1)).toBeUndefined();
	});
});
