import { searchPlants } from "@/features/plants/searchPlants";

const details = { type: null, origin: null, location: null, outdoor: false };

const plants = [
	{
		...details,
		nickname: "Raven",
		name: "Zamioculcas",
		scientificName: null,
		type: "succulent" as const,
		location: "kitchen" as const,
	},
	{
		...details,
		nickname: null,
		name: "Monstera",
		scientificName: "Monstera deliciosa",
		origin: "gift" as const,
	},
	{
		...details,
		nickname: "Zoé",
		name: "Pothos",
		scientificName: "Epipremnum aureum",
		location: "kitchen" as const,
		outdoor: true,
	},
];

const namesOf = (query: string) =>
	searchPlants(plants, query).map((plant) => plant.name);

describe("searchPlants", () => {
	it("returns every plant for an empty query", () => {
		expect(namesOf("  ")).toHaveLength(3);
	});

	it("searches the nickname, name and scientific name", () => {
		expect(namesOf("raven")).toEqual(["Zamioculcas"]);
		expect(namesOf("pothos")).toEqual(["Pothos"]);
		expect(namesOf("deliciosa")).toEqual(["Monstera"]);
	});

	it("ignores case and accents", () => {
		expect(namesOf("zoe")).toEqual(["Pothos"]);
		expect(namesOf("ZOÉ")).toEqual(["Pothos"]);
	});

	it("matches a part of a word", () => {
		expect(namesOf("mon")).toEqual(["Monstera"]);
	});

	it("returns nothing when no plant matches", () => {
		expect(namesOf("cactus")).toEqual([]);
	});

	it("searches the French labels of the type, origin and room", () => {
		expect(namesOf("succulente")).toEqual(["Zamioculcas"]);
		expect(namesOf("cadeau")).toEqual(["Monstera"]);
		expect(namesOf("cuisine")).toEqual(["Zamioculcas"]);
	});

	it("finds an outdoor plant by « extérieur », not by its former room", () => {
		expect(namesOf("exterieur")).toEqual(["Pothos"]);
	});
});
