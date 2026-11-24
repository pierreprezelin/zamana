import { isOneOf } from "@/utils/isOneOf";

describe("isOneOf", () => {
	const COLORS = ["red", "green"] as const;

	it.each([
		["red", true],
		["green", true],
		["blue", false],
		[undefined, false],
		[1, false],
	])("%p is one of the colors: %s", (value, expected) => {
		expect(isOneOf(COLORS, value)).toBe(expected);
	});
});
