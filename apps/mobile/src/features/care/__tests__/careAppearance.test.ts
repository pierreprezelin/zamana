import { careAppearance } from "@/features/care/careAppearance";
import { CARE_TYPES } from "@/features/care/careTypes";

describe("careAppearance", () => {
	it.each(CARE_TYPES)("has a complete appearance for %s", (type) => {
		const { icon, background, tint, text } = careAppearance[type];

		for (const value of [icon, background, tint, text]) {
			expect(value).toEqual(expect.any(String));
			expect(value).not.toBe("");
		}
	});

	it("has no appearance for something else than a care type", () => {
		expect(Object.keys(careAppearance).sort()).toEqual([...CARE_TYPES].sort());
	});
});
