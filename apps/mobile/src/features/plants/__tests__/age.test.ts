import {
	ageToBornAt,
	bornAtToAge,
	formatAge,
	resolveBornAt,
} from "@/features/plants/age";

const now = new Date(2026, 9, 18, 15, 30);

describe("age", () => {
	it.each([
		[{ amount: 12, unit: "day" as const }, "2026-10-06"],
		[{ amount: 5, unit: "month" as const }, "2026-05-18"],
		[{ amount: 3, unit: "year" as const }, "2023-10-18"],
	])("turns %o into a birth date", (age, bornAt) => {
		expect(ageToBornAt(age, now)).toBe(bornAt);
		expect(bornAtToAge(bornAt, now)).toEqual(age);
	});

	it("uses the largest whole unit", () => {
		expect(bornAtToAge("2025-04-18", now)).toEqual({
			amount: 1,
			unit: "year",
		});
		expect(bornAtToAge("2026-09-19", now)).toEqual({
			amount: 29,
			unit: "day",
		});
	});

	it("counts at least one day", () => {
		expect(bornAtToAge("2026-10-18", now)).toEqual({ amount: 1, unit: "day" });
	});

	it.each([
		["2026-10-17", "1 jour"],
		["2026-10-06", "12 jours"],
		["2026-09-18", "1 mois"],
		["2026-05-18", "5 mois"],
		["2025-10-18", "1 an"],
		["2023-10-18", "3 ans"],
	])("formats the age of a plant born on %s", (bornAt, age) => {
		expect(formatAge(bornAt, now)).toBe(age);
	});

	describe("resolveBornAt", () => {
		it("has no birth date without an age", () => {
			expect(resolveBornAt(null, "2025-04-18", now)).toBeNull();
		});

		it("keeps the stored date when the rounded age is unchanged", () => {
			expect(
				resolveBornAt({ amount: 1, unit: "year" }, "2025-04-18", now),
			).toBe("2025-04-18");
		});

		it("computes a new date when the age changed", () => {
			expect(
				resolveBornAt({ amount: 2, unit: "year" }, "2025-04-18", now),
			).toBe("2024-10-18");
			expect(resolveBornAt({ amount: 5, unit: "month" }, null, now)).toBe(
				"2026-05-18",
			);
		});
	});
});
