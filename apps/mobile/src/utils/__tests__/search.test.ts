import { normalizeForSearch } from "@/utils/search";

describe("normalizeForSearch", () => {
	it("drops accents and case", () => {
		expect(normalizeForSearch("Lumière")).toBe("lumiere");
	});

	it("spells out the œ and æ ligatures, typed oe and ae", () => {
		expect(normalizeForSearch("Chaîne des Cœurs")).toBe("chaine des coeurs");
		expect(normalizeForSearch("Ægopode")).toBe("aegopode");
	});
});
