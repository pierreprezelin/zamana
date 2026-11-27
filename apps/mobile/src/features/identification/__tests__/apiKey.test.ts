import { apiKeySchema, maskKey } from "@/features/identification/apiKey";

describe("apiKeySchema", () => {
	it("accepts a key pasted with spaces around, without them", () => {
		expect(apiKeySchema.parse("  2b10fakefakefakefakefake \n")).toBe(
			"2b10fakefakefakefakefake",
		);
	});

	it.each([
		["too short", "2b10fake"],
		["too long", "a".repeat(65)],
		["with special characters", "2b10fake-fake/fake?fake=1"],
		["with a space inside", "2b10fakefake fakefakefake"],
		["empty", "   "],
	])("refuses a key %s", (_, key) => {
		expect(apiKeySchema.safeParse(key).success).toBe(false);
	});
});

describe("maskKey", () => {
	it("shows only the last 4 characters", () => {
		expect(maskKey("2b10fakefakefakefake3f9a")).toBe("•••• 3f9a");
	});
});
