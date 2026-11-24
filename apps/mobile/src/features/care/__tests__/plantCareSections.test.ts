import type { Care, CareLog } from "@/features/care/careTypes";
import { plantCareSections } from "@/features/care/plantCareSections";

const today = "2026-06-10";

const care = (type: Care["type"], overrides: Partial<Care> = {}): Care => ({
	id: `minette-${type}`,
	plantId: "minette",
	type,
	frequency: type === "watering" ? null : { amount: 1, unit: "week" },
	period: null,
	lastDoneAt: "2026-06-08",
	startedAt: "2026-01-01",
	snoozedUntil: null,
	reminder: true,
	...overrides,
});

const log = (
	type: Care["type"],
	outcome: CareLog["outcome"],
	previousLastDoneAt: string | null,
): CareLog => ({
	id: `log-${type}`,
	plantId: "minette",
	type,
	outcome,
	date: today,
	createdAt: `${today}T09:42:00.000Z`,
	previousLastDoneAt,
	previousSnoozedUntil: null,
});

const run = (cares: Care[], logs: CareLog[] = []) =>
	plantCareSections({
		cares,
		logs,
		context: { wateringLevel: 2, climate: "north" },
		today,
	});

const types = (entries: { care: Care }[]) =>
	entries.map((entry) => entry.care.type);

describe("plantCareSections", () => {
	it("also lists a care done today among the upcoming ones, with its next due date", () => {
		const sections = run(
			[care("watering", { lastDoneAt: today })],
			[log("watering", "done", "2026-06-01")],
		);

		expect(types(sections.handledToday)).toEqual(["watering"]);
		expect(types(sections.upcoming)).toEqual(["watering"]);
		expect(sections.upcoming[0]?.dueDate).toBe("2026-06-17");
		expect(sections.next?.care.type).toBe("watering");
	});

	it("also lists a care skipped today among the upcoming ones", () => {
		const sections = run(
			[
				care("pruning", {
					lastDoneAt: "2026-06-03",
					snoozedUntil: "2026-06-11",
				}),
			],
			[log("pruning", "skipped", "2026-06-03")],
		);

		expect(types(sections.handledToday)).toEqual(["pruning"]);
		expect(types(sections.upcoming)).toEqual(["pruning"]);
		expect(sections.next?.dueDate).toBe("2026-06-11");
	});

	it("keeps a due care out of the upcoming ones", () => {
		const sections = run([
			care("pruning", { lastDoneAt: "2026-06-03" }),
			care("misting", { lastDoneAt: "2026-06-09" }),
		]);

		expect(types(sections.due)).toEqual(["pruning"]);
		expect(types(sections.upcoming)).toEqual(["misting"]);
		expect(sections.handledToday).toEqual([]);
	});

	it("points to the soonest upcoming care", () => {
		const sections = run([
			care("repotting", { frequency: { amount: 1, unit: "year" } }),
			care("misting", { lastDoneAt: "2026-06-09" }),
		]);

		expect(sections.next?.care.type).toBe("misting");
	});
});
