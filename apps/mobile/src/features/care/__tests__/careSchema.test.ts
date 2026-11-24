import { careInputSchema } from "@/features/care/careSchema";

const input = (overrides = {}) => ({
	type: "fertilizing",
	frequency: { amount: 4, unit: "week" },
	period: null,
	lastDoneAt: null,
	reminder: true,
	...overrides,
});

const errorOf = (values: object) =>
	careInputSchema.safeParse(values).error?.issues[0]?.message;

describe("careInputSchema", () => {
	it("accepts a complete care", () => {
		expect(careInputSchema.parse(input())).toEqual(input());
	});

	it("requires a frequency when reminders are on", () => {
		expect(errorOf(input({ frequency: null }))).toBe(
			"Indiquez une fréquence pour recevoir des rappels.",
		);
	});

	it("allows no frequency when reminders are off", () => {
		expect(
			careInputSchema.safeParse(input({ frequency: null, reminder: false }))
				.success,
		).toBe(true);
	});

	it("never asks a frequency for watering", () => {
		const watering = input({ type: "watering", frequency: null });
		expect(careInputSchema.safeParse(watering).success).toBe(true);
	});

	it.each([0, 100, 1.5])("refuses a frequency of %d", (amount) => {
		expect(errorOf(input({ frequency: { amount, unit: "week" } }))).toBe(
			"La fréquence doit être comprise entre 1 et 99.",
		);
	});

	it.each([0, 13])("refuses a month %d in the period", (month) => {
		expect(
			careInputSchema.safeParse(
				input({ period: { startMonth: month, endMonth: 5 } }),
			).success,
		).toBe(false);
	});

	describe("the last time", () => {
		beforeEach(() =>
			jest.useFakeTimers({ now: new Date(2026, 5, 10, 23, 59) }),
		);
		afterEach(() => jest.useRealTimers());

		it("can be today", () => {
			expect(errorOf(input({ lastDoneAt: "2026-06-10" }))).toBeUndefined();
		});

		it("cannot be in the future", () => {
			expect(errorOf(input({ lastDoneAt: "2026-06-11" }))).toBe(
				"La date ne peut pas être dans le futur.",
			);
		});
	});
});
