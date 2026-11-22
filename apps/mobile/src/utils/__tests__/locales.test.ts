import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import nativeEn from "@/locales/native/en.json";
import nativeFr from "@/locales/native/fr.json";

// Objects and arrays, like the levels of a need
const flatten = (translations: object, prefix = ""): [string, string][] =>
	Object.entries(translations).flatMap(([key, value]) =>
		typeof value === "string"
			? [[`${prefix}${key}`, value]]
			: flatten(value, `${prefix}${key}.`),
	);

const variables = (text: string) => (text.match(/{{\w+}}/g) ?? []).sort();

describe.each([
	["app", fr, en],
	["native", nativeFr, nativeEn],
])("%s translations", (_, french, english) => {
	const frenchEntries = new Map(flatten(french));
	const englishEntries = new Map(flatten(english));

	it("have the same keys in French and English", () => {
		expect([...englishEntries.keys()].sort()).toEqual(
			[...frenchEntries.keys()].sort(),
		);
	});

	it("use the same variables in both languages", () => {
		for (const [key, text] of frenchEntries) {
			expect([key, variables(englishEntries.get(key) ?? "")]).toEqual([
				key,
				variables(text),
			]);
		}
	});

	it("have no empty text", () => {
		const emptyKeys = [...frenchEntries, ...englishEntries]
			.filter(([, text]) => !text.trim())
			.map(([key]) => key);

		expect(emptyKeys).toEqual([]);
	});
});
