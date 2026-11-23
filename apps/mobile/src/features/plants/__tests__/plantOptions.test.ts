import {
	archiveReasonOptions,
	needs,
	needValue,
	originOptions,
	seasonOptions,
} from "@/features/plants/plantOptions";

const labelsOf = (options: { label: string }[]) =>
	options.map(({ label }) => label);

describe("plant options", () => {
	it("sorts the open lists alphabetically, accents included", () => {
		expect(labelsOf(originOptions)).toEqual([
			"Bouture",
			"Cadeau",
			"Échange",
			"Magasin",
			"Récupérée",
			"Semis",
		]);
	});

	it("keeps the natural order of the other lists", () => {
		expect(labelsOf(seasonOptions)).toEqual([
			"Printemps",
			"Été",
			"Automne",
			"Hiver",
		]);
		expect(archiveReasonOptions.at(-1)?.value).toBe("other");
	});
});

describe("needValue", () => {
	const plant = { light: 2, watering: 1, temperature: 2, humidity: 2 };
	const [, watering, temperature] = needs;

	it("details the watering frequency", () => {
		expect(needValue(watering, { ...plant, outdoor: false })).toBe(
			"Tous les 2-3 jours",
		);
	});

	it("says where the temperature applies", () => {
		expect(needValue(temperature, { ...plant, outdoor: true })).toBe(
			"Tempérée · Extérieur",
		);
	});
});
