import {
	type PlantFormValues,
	plantInputSchema,
} from "@/features/plants/plantSchema";

const validPlant: PlantFormValues = {
	photo: null,
	nickname: "",
	name: "Monstera",
	type: null,
	scientificName: "",
	origin: null,
	acquiredAt: null,
	location: null,
	age: null,
	light: 2,
	watering: 2,
	temperature: 2,
	humidity: 2,
	outdoor: false,
	toxic: false,
	floweringSeasons: [],
	floweringType: null,
	lifespan: null,
	notes: "",
};

const parse = (overrides: Partial<PlantFormValues>) =>
	plantInputSchema.safeParse({ ...validPlant, ...overrides });

const errorOf = (overrides: Partial<PlantFormValues>) =>
	parse(overrides).error?.issues[0]?.message;

describe("plantInputSchema", () => {
	it("accepts a plant with only a name", () => {
		expect(parse({}).success).toBe(true);
	});

	it("trims texts and turns empty ones into null", () => {
		const plant = plantInputSchema.parse({
			...validPlant,
			name: "  Monstera ",
			nickname: "   ",
			scientificName: "",
			notes: " Arrosée ",
		});

		expect(plant).toMatchObject({
			name: "Monstera",
			nickname: null,
			scientificName: null,
			notes: "Arrosée",
		});
	});

	it("requires a name", () => {
		expect(errorOf({ name: "  " })).toBe("Le nom est obligatoire.");
	});

	it.each([
		["nickname", 20, "Le surnom ne peut pas dépasser 20 caractères."],
		["name", 50, "Le nom ne peut pas dépasser 50 caractères."],
		[
			"scientificName",
			50,
			"Le nom scientifique ne peut pas dépasser 50 caractères.",
		],
		["notes", 500, "La note ne peut pas dépasser 500 caractères."],
	])("limits %s to %i characters", (field, max, message) => {
		expect(parse({ [field]: "a".repeat(max) }).success).toBe(true);
		expect(errorOf({ [field]: "a".repeat(max + 1) })).toBe(message);
	});

	it.each([0, 101, 1.5, Number.NaN])("rejects an age of %d", (amount) => {
		expect(parse({ age: { amount, unit: "year" } }).success).toBe(false);
	});

	it.each([1, 100])("accepts an age of %i", (amount) => {
		expect(parse({ age: { amount, unit: "day" } }).success).toBe(true);
	});

	it.each([0, 4])("rejects a need level of %i", (light) => {
		expect(parse({ light }).success).toBe(false);
	});

	it("rejects an acquisition date in the future", () => {
		expect(errorOf({ acquiredAt: "2999-01-01" })).toBe(
			"La date ne peut pas être dans le futur.",
		);
		expect(parse({ acquiredAt: "2020-05-12" }).success).toBe(true);
	});

	it("removes the room of an outdoor plant", () => {
		expect(
			plantInputSchema.parse({
				...validPlant,
				outdoor: true,
				location: "kitchen",
			}).location,
		).toBeNull();
	});
});
