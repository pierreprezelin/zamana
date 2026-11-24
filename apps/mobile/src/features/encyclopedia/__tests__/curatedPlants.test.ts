import i18next from "i18next";
import {
	CATEGORIES,
	CURATED_PLANTS,
	categoryTaxonIds,
	pickedPhoto,
	searchCuratedPlants,
} from "@/features/encyclopedia/curatedPlants";
import { isInaturalistPhoto } from "@/features/encyclopedia/inaturalist";
import { plantInputSchema } from "@/features/plants/plantSchema";

describe("curatedPlants", () => {
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

	it("picks for each plant an open photo served by iNaturalist", () => {
		for (const { taxonId } of CURATED_PLANTS) {
			const photo = pickedPhoto(taxonId);
			expect(isInaturalistPhoto(photo?.url)).toBe(true);
			expect(photo?.attribution).toMatch(
				/\(CC BY(-SA)?\)|no rights reserved|public domain/i,
			);
		}
	});

	it("names each plant as it is known, in French and in English", () => {
		for (const plant of CURATED_PLANTS) {
			expect(plant.names.fr.trim()).not.toBe("");
			expect(plant.names.en.trim()).not.toBe("");
			expect(plant.scientificName.trim()).not.toBe("");
		}
	});
});

describe("searchCuratedPlants", () => {
	afterEach(() => i18next.changeLanguage("fr"));

	const found = (query: string) =>
		searchCuratedPlants(query).map((plant) => plant.scientificName);

	it("finds a plant by the name it is known by", () => {
		expect(found("pothos")).toEqual(["Epipremnum aureum"]);
		expect(found("zz")).toEqual([]);
		expect(found("langue de belle")).toEqual(["Sansevieria trifasciata"]);
	});

	it("searches the names of the app language", async () => {
		await i18next.changeLanguage("en");
		expect(found("langue")).toEqual([]);
		expect(found("zz")).toEqual(["Zamioculcas zamiifolia"]);
	});

	it("ignores accents and case", () => {
		expect(found("begonia")).toEqual(["Begonia rex"]);
		expect(found("CALATHÉA")).toEqual(["Goeppertia orbifolia"]);
	});

	it("keeps the most popular first", () => {
		const ficus = found("ficus");
		expect(ficus[0]).toBe("Ficus lyrata");
		expect(ficus).toEqual(
			CURATED_PLANTS.filter((plant) =>
				ficus.includes(plant.scientificName),
			).map((plant) => plant.scientificName),
		);
	});
});
