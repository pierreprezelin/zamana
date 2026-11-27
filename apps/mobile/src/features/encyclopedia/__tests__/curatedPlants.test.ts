import i18next from "i18next";
import {
	CATEGORIES,
	CURATED_PLANTS,
	categoryTaxonIds,
	matchedAlias,
	pickedPhoto,
	searchCuratedPlants,
} from "@/features/encyclopedia/curatedPlants";
import {
	isInaturalistPhoto,
	MAX_IDS_PER_REQUEST,
} from "@/features/encyclopedia/inaturalist";
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

	it.each(CATEGORIES.filter((category) => category !== "popular"))(
		"shows 20 plants in the %s tab",
		(category) => {
			expect(categoryTaxonIds(category)).toHaveLength(20);
		},
	);

	it("shows the 30 most common plants in the popular tab", () => {
		expect(categoryTaxonIds("popular").length).toBeLessThanOrEqual(
			MAX_IDS_PER_REQUEST,
		);
		expect(categoryTaxonIds("popular")).toEqual(
			CURATED_PLANTS.slice(0, 30).map((plant) => plant.taxonId),
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

	it("gives no nickname that a name already finds", () => {
		for (const { names, aliases, scientificName } of CURATED_PLANTS) {
			for (const language of ["fr", "en"] as const) {
				for (const alias of aliases[language]) {
					expect(alias.trim()).not.toBe("");
					expect(names[language].toLowerCase()).not.toContain(
						alias.toLowerCase(),
					);
					expect(scientificName.toLowerCase()).not.toContain(
						alias.toLowerCase(),
					);
				}
			}
		}
	});
});

describe("matchedAlias", () => {
	afterEach(() => i18next.changeLanguage("fr"));

	const curatedNamed = (scientificName: string) => {
		const plant = CURATED_PLANTS.find(
			(candidate) => candidate.scientificName === scientificName,
		);
		if (!plant) throw new Error(`${scientificName} is not curated`);
		return plant;
	};
	const peaceLily = () => curatedNamed("Spathiphyllum wallisii");

	it("gives the nickname a search found the plant by", () => {
		expect(matchedAlias(peaceLily(), "fleur de")).toBe("fleur de lune");
		expect(matchedAlias(peaceLily(), " FLEUR DE LUNE ")).toBe("fleur de lune");
	});

	it("gives none when the shown names already match", () => {
		expect(matchedAlias(peaceLily(), "spathi")).toBeNull();
		expect(matchedAlias(peaceLily(), "wallisii")).toBeNull();
	});

	it("looks in the nicknames of the app language", async () => {
		await i18next.changeLanguage("en");
		expect(matchedAlias(peaceLily(), "fleur de")).toBeNull();
		expect(matchedAlias(curatedNamed("Epipremnum aureum"), "devil")).toBe(
			"devil's ivy",
		);
	});
});

describe("searchCuratedPlants", () => {
	afterEach(() => i18next.changeLanguage("fr"));

	const found = (query: string) =>
		searchCuratedPlants(query).map((plant) => plant.scientificName);

	it("finds a plant by the name it is known by", () => {
		expect(found("pothos")).toEqual(["Epipremnum aureum", "Scindapsus pictus"]);
		expect(found("langue de belle")).toEqual(["Sansevieria trifasciata"]);
	});

	it("finds a plant by a nickname more known than its name", () => {
		expect(found("fleur de lune")).toEqual(["Spathiphyllum wallisii"]);
		expect(found("lierre du diable")).toEqual(["Epipremnum aureum"]);
	});

	it("finds a plant by its scientific name, in any language", async () => {
		expect(found("benjamina")).toEqual(["Ficus benjamina"]);
		await i18next.changeLanguage("en");
		expect(found("benjamina")).toEqual(["Ficus benjamina"]);
	});

	it("matches a scientific name from the start of a word only", () => {
		expect(found("enjamina")).toEqual([]);
		expect(found("ficus benj")).toEqual(["Ficus benjamina"]);
	});

	it("searches the names of the app language", async () => {
		expect(found("snake")).toEqual([]);
		await i18next.changeLanguage("en");
		expect(found("langue")).toEqual([]);
		expect(found("fleur de lune")).toEqual([]);
		expect(found("zz")).toEqual(["Zamioculcas zamiifolia"]);
		expect(found("devil's ivy")).toEqual(["Epipremnum aureum"]);
	});

	it("ignores accents and case", () => {
		expect(found("begonia")).toEqual(["Begonia rex", "Begonia maculata"]);
		expect(found("CALATHÉA ORBI")).toEqual(["Goeppertia orbifolia"]);
	});

	it("keeps the most popular first", () => {
		const ficus = found("ficus");
		expect(ficus[0]).toBe("Ficus elastica");
		expect(ficus).toEqual(
			CURATED_PLANTS.filter((plant) =>
				ficus.includes(plant.scientificName),
			).map((plant) => plant.scientificName),
		);
	});
});
