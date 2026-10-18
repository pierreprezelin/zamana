import {
	archiveReasonOptions,
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
