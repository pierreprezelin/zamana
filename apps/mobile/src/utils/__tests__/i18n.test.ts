import i18next from "i18next";
import { lowerFirst, pluralForm } from "@/utils/i18n";

afterEach(() => i18next.changeLanguage("fr"));

describe("pluralForm", () => {
	it("keeps zero and one singular in French", () => {
		expect([0, 1, 2].map(pluralForm)).toEqual(["one", "one", "other"]);
	});

	it("makes only one singular in English", async () => {
		await i18next.changeLanguage("en");

		expect([0, 1, 2].map(pluralForm)).toEqual(["other", "one", "other"]);
	});
});

describe("lowerFirst", () => {
	it("lowercases only the first letter, to keep English month names", () => {
		expect(lowerFirst("In March 2027")).toBe("in March 2027");
		expect(lowerFirst("En mars 2027")).toBe("en mars 2027");
	});
});
