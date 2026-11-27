import { greeting } from "@/features/user/greeting";

describe("greeting", () => {
	it.each([
		[5, "Belle matinée"],
		[11, "Belle matinée"],
		[12, "Bonjour"],
		[17, "Bonjour"],
		[18, "Bonsoir"],
		[23, "Bonsoir"],
		[0, "Belle soirée"],
		[4, "Belle soirée"],
	])("greets according to the time of day at %ih", (hour, expected) => {
		expect(greeting(hour, null)).toBe(`${expected}\u00A0👋`);
	});

	it("addresses the user by name when there is one", () => {
		expect(greeting(9, "John")).toBe("Belle matinée, John\u00A0👋");
	});

	it("keeps the emoji on the same line as the last word", () => {
		expect(greeting(9, null)).toBe("Belle matinée\u00A0👋");
	});
});
