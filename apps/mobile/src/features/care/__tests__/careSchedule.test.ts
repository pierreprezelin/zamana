import {
	careProgress,
	careStatus,
	nextCare,
	nextDueDate,
	snoozeUntil,
	wasDueWhenDone,
	wateringIntervalDays,
} from "@/features/care/careSchedule";
import type { Care, CareLog } from "@/features/care/careTypes";

const care = (overrides: Partial<Care> = {}): Care => ({
	id: "care-1",
	plantId: "plant-1",
	type: "fertilizing",
	frequency: { amount: 4, unit: "week" },
	period: null,
	lastDoneAt: "2026-06-01",
	startedAt: "2026-01-01",
	snoozedUntil: null,
	reminder: true,
	...overrides,
});

const watering = (overrides: Partial<Care> = {}) =>
	care({ type: "watering", frequency: null, ...overrides });

const context = (overrides = {}) => ({
	wateringLevel: 2,
	climate: "north" as const,
	...overrides,
});

describe("wateringIntervalDays", () => {
	it.each([
		[1, 2, 3],
		[2, 7, 14],
		[3, 30, 45],
	])(
		"level %i waters every %i days when growing, %i when resting",
		(level, growing, resting) => {
			expect(wateringIntervalDays(level, "2026-06-15", "north")).toBe(growing);
			expect(wateringIntervalDays(level, "2026-11-15", "north")).toBe(resting);
		},
	);

	it.each([
		["2026-03-31", 14],
		["2026-04-01", 7],
		["2026-09-30", 7],
		["2026-10-01", 14],
	])("in the north, %s is %i days apart", (date, days) => {
		expect(wateringIntervalDays(2, date, "north")).toBe(days);
	});

	it.each([
		["2026-03-31", 7],
		["2026-04-01", 14],
		["2026-09-30", 14],
		["2026-10-01", 7],
	])("in the south, %s is %i days apart", (date, days) => {
		expect(wateringIntervalDays(2, date, "south")).toBe(days);
	});

	it("keeps the growing interval all year in the tropics", () => {
		expect(wateringIntervalDays(2, "2026-01-15", "tropics")).toBe(7);
		expect(wateringIntervalDays(2, "2026-07-15", "tropics")).toBe(7);
	});
});

describe("nextDueDate", () => {
	it("adds the watering interval of the season of the last watering", () => {
		expect(nextDueDate(watering({ lastDoneAt: "2026-06-10" }), context())).toBe(
			"2026-06-17",
		);
		expect(nextDueDate(watering({ lastDoneAt: "2026-11-10" }), context())).toBe(
			"2026-11-24",
		);
	});

	it("follows the climate", () => {
		const lastNovember = watering({ lastDoneAt: "2026-11-10" });
		expect(nextDueDate(lastNovember, context({ climate: "tropics" }))).toBe(
			"2026-11-17",
		);
	});

	it("counts from the start of tracking when never done", () => {
		const newPlant = watering({ lastDoneAt: null, startedAt: "2026-06-10" });
		expect(nextDueDate(newPlant, context({ wateringLevel: 1 }))).toBe(
			"2026-06-12",
		);
	});

	it("asks right away for a never done care of a month or more", () => {
		const fertilizing = care({
			frequency: { amount: 1, unit: "year" },
			period: { startMonth: 9, endMonth: 12 },
			lastDoneAt: null,
			startedAt: "2026-11-18",
		});
		expect(nextDueDate(fertilizing, context())).toBe("2026-11-18");
		expect(
			nextDueDate(
				care({
					frequency: { amount: 1, unit: "month" },
					lastDoneAt: null,
					startedAt: "2026-11-18",
				}),
				context(),
			),
		).toBe("2026-11-18");
	});

	it("keeps the first watering one interval away, even a long one", () => {
		const newPlant = watering({ lastDoneAt: null, startedAt: "2026-11-18" });
		expect(nextDueDate(newPlant, context({ wateringLevel: 3 }))).toBe(
			"2027-01-02",
		);
	});

	it("waits one interval for a never done care under a month", () => {
		const weekly = care({
			frequency: { amount: 2, unit: "week" },
			lastDoneAt: null,
			startedAt: "2026-11-18",
		});
		expect(nextDueDate(weekly, context())).toBe("2026-12-02");
	});

	it.each([
		[{ amount: 3, unit: "day" as const }, "2026-06-04"],
		[{ amount: 2, unit: "week" as const }, "2026-06-15"],
		[{ amount: 1, unit: "month" as const }, "2026-07-01"],
		[{ amount: 2, unit: "year" as const }, "2028-06-01"],
	])("adds a frequency of %o", (frequency, due) => {
		expect(nextDueDate(care({ frequency }), context())).toBe(due);
	});

	it("keeps the end of a shorter month", () => {
		const endOfJanuary = care({
			frequency: { amount: 1, unit: "month" },
			lastDoneAt: "2026-01-31",
		});
		expect(nextDueDate(endOfJanuary, context())).toBe("2026-02-28");
	});

	it("has no due date without a frequency", () => {
		expect(nextDueDate(care({ frequency: null }), context())).toBeNull();
	});

	it("waits for a later snooze", () => {
		const snoozed = care({
			lastDoneAt: "2026-06-01",
			snoozedUntil: "2026-07-03",
		});
		expect(nextDueDate(snoozed, context())).toBe("2026-07-03");
	});

	it("ignores a snooze older than the due date", () => {
		const done = care({ lastDoneAt: "2026-06-01", snoozedUntil: "2026-05-20" });
		expect(nextDueDate(done, context())).toBe("2026-06-29");
	});

	it("moves a due date outside the period to the next period start", () => {
		const fertilizing = care({
			lastDoneAt: "2026-10-20",
			period: { startMonth: 3, endMonth: 10 },
		});
		expect(nextDueDate(fertilizing, context())).toBe("2027-03-01");
	});

	it("keeps a due date inside the period", () => {
		const fertilizing = care({
			lastDoneAt: "2026-06-01",
			period: { startMonth: 3, endMonth: 10 },
		});
		expect(nextDueDate(fertilizing, context())).toBe("2026-06-29");
	});

	it("handles a period over the new year", () => {
		const winter = { startMonth: 11, endMonth: 2 };
		expect(
			nextDueDate(
				care({ lastDoneAt: "2026-12-20", period: winter }),
				context(),
			),
		).toBe("2027-01-17");
		expect(
			nextDueDate(
				care({ lastDoneAt: "2026-02-20", period: winter }),
				context(),
			),
		).toBe("2026-11-01");
	});

	it("pauses a late care outside its period", () => {
		const fertilizing = care({
			frequency: { amount: 1, unit: "month" },
			lastDoneAt: "2026-09-15",
			period: { startMonth: 3, endMonth: 10 },
		});
		expect(nextDueDate(fertilizing, context(), "2026-12-05")).toBe(
			"2027-03-01",
		);
		expect(nextDueDate(fertilizing, context(), "2026-10-20")).toBe(
			"2026-10-15",
		);
	});

	it("handles a single month period", () => {
		const may = { startMonth: 5, endMonth: 5 };
		expect(
			nextDueDate(care({ lastDoneAt: "2026-05-10", period: may }), context()),
		).toBe("2027-05-01");
	});
});

describe("snoozeUntil", () => {
	it.each([
		[1, "2026-06-11"],
		[2, "2026-06-12"],
		[3, "2026-06-18"],
	])("asks again after a quarter of watering level %i", (level, date) => {
		expect(
			snoozeUntil(watering(), "2026-06-10", context({ wateringLevel: level })),
		).toBe(date);
	});

	it("uses the rest season interval in winter", () => {
		expect(snoozeUntil(watering(), "2026-11-10", context())).toBe("2026-11-14");
	});

	it("scales with long frequencies", () => {
		const repotting = care({ frequency: { amount: 2, unit: "year" } });
		expect(snoozeUntil(repotting, "2026-06-10", context())).toBe("2026-12-10");
	});
});

describe("careStatus", () => {
	it.each([
		["2026-06-08", { kind: "late", days: 2 }],
		["2026-06-10", { kind: "today" }],
		["2026-06-14", { kind: "upcoming", days: 4 }],
	])("for a due date on %s", (due, status) => {
		expect(careStatus(due, "2026-06-10")).toEqual(status);
	});
});

describe("careProgress", () => {
	it("is the share of the interval already elapsed", () => {
		expect(
			careProgress(
				watering({ lastDoneAt: "2026-06-10" }),
				"2026-06-13",
				context(),
			),
		).toBeCloseTo(3 / 7);
	});

	it("follows a snooze", () => {
		const snoozed = watering({
			lastDoneAt: "2026-06-03",
			snoozedUntil: "2026-06-12",
		});
		expect(careProgress(snoozed, "2026-06-10", context())).toBeCloseTo(7 / 9);
	});

	it("is full once due", () => {
		expect(
			careProgress(
				watering({ lastDoneAt: "2026-06-01" }),
				"2026-06-20",
				context(),
			),
		).toBe(1);
	});

	it("is null without a due date", () => {
		expect(
			careProgress(care({ frequency: null }), "2026-06-20", context()),
		).toBeNull();
	});
});

describe("wasDueWhenDone", () => {
	const log = (previousLastDoneAt: string | null): CareLog => ({
		id: "log-1",
		plantId: "plant-1",
		type: "watering",
		outcome: "done",
		date: "2026-06-10",
		createdAt: "2026-06-10T09:00:00.000Z",
		previousLastDoneAt,
		previousSnoozedUntil: null,
	});
	const doneToday = watering({ lastDoneAt: "2026-06-10" });

	it("is true for a care that was due", () => {
		expect(
			wasDueWhenDone(doneToday, log("2026-06-01"), context(), "2026-06-10"),
		).toBe(true);
	});

	it("is false for a care done ahead of time", () => {
		expect(
			wasDueWhenDone(doneToday, log("2026-06-08"), context(), "2026-06-10"),
		).toBe(false);
	});
});

describe("nextCare", () => {
	// Weekly cares: done on June 1 means due on June 8
	const weekly = (id: string, lastDoneAt: string, overrides = {}) =>
		care({
			id,
			frequency: { amount: 1, unit: "week" },
			lastDoneAt,
			...overrides,
		});

	it("picks the care due the soonest, the latest first", () => {
		const next = nextCare(
			[weekly("upcoming", "2026-06-08"), weekly("late", "2026-06-01")],
			context(),
			"2026-06-10",
		);
		expect(next?.care.id).toBe("late");
		expect(next?.dueDate).toBe("2026-06-08");
	});

	it("counts the other due cares, not the upcoming ones", () => {
		const next = nextCare(
			[
				weekly("late", "2026-06-01"),
				weekly("today", "2026-06-03", { type: "pruning" }),
				weekly("upcoming", "2026-06-08", { type: "misting" }),
			],
			context(),
			"2026-06-10",
		);
		expect(next?.otherDueCount).toBe(1);
	});

	it("skips the cares without a due date", () => {
		expect(
			nextCare([care({ frequency: null })], context(), "2026-06-10"),
		).toBeNull();
		expect(nextCare([], context(), "2026-06-10")).toBeNull();
	});

	it("picks a dated care over one without a due date", () => {
		const next = nextCare(
			[care({ id: "undated", frequency: null }), weekly("dated", "2026-06-08")],
			context(),
			"2026-06-10",
		);
		expect(next?.care.id).toBe("dated");
	});
});
