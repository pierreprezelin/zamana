import { careOverview } from "@/features/care/careOverview";
import type { Care, CareLog } from "@/features/care/careTypes";
import type { Plant } from "@/features/plants/plantSchema";

const TODAY = "2026-06-10";

const plant = (id: string, overrides: Partial<Plant> = {}) =>
	({ id, name: id, watering: 2, archivedAt: null, ...overrides }) as Plant;

const care = (
	plantId: string,
	type: Care["type"],
	lastDoneAt: string | null,
	overrides: Partial<Care> = {},
): Care => ({
	id: `${plantId}-${type}`,
	plantId,
	type,
	frequency: type === "watering" ? null : { amount: 1, unit: "week" },
	period: null,
	lastDoneAt,
	startedAt: "2026-01-01",
	snoozedUntil: null,
	reminder: true,
	...overrides,
});

const careLog = (
	plantId: string,
	type: Care["type"],
	date = TODAY,
): CareLog => ({
	id: `log-${plantId}-${type}`,
	plantId,
	type,
	outcome: "done",
	date,
	createdAt: `${date}T09:42:00.000Z`,
	previousLastDoneAt: "2026-06-01",
	previousSnoozedUntil: null,
});

const run = (plants: Plant[], cares: Care[], logs: CareLog[] = []) =>
	careOverview({ plants, cares, logs, today: TODAY, climate: "north" });

const plantIds = (entries: { plant: Plant }[] | undefined) =>
	entries?.map((entry) => entry.plant.id);

describe("careOverview", () => {
	it("lists the configured care types in the care settings order", () => {
		const { types } = run(
			[plant("raven"), plant("monstera")],
			[
				care("raven", "misting", "2026-06-05"),
				care("monstera", "watering", "2026-06-05"),
				care("raven", "fertilizing", "2026-06-05"),
			],
		);
		expect(types).toEqual(["watering", "fertilizing", "misting"]);
	});

	it("leaves archived plants out, with the types only they have", () => {
		const { types, sectionsByType } = run(
			[
				plant("raven"),
				plant("ficus", { archivedAt: "2026-06-01T00:00:00.000Z" }),
			],
			[
				care("raven", "watering", "2026-06-05"),
				care("ficus", "watering", "2026-06-01"),
				care("ficus", "pruning", "2026-06-01"),
			],
		);
		expect(types).toEqual(["watering"]);
		expect(plantIds(sectionsByType.get("watering")?.upcoming)).toEqual([
			"raven",
		]);
	});

	it("sorts the due cares oldest first and the upcoming ones soonest first", () => {
		const { sectionsByType } = run(
			[
				plant("ficus"),
				plant("monstera"),
				plant("raven"),
				plant("pothos"),
				plant("calathea"),
			],
			[
				care("ficus", "watering", "2026-06-08"),
				care("monstera", "watering", "2026-06-03"),
				care("raven", "watering", "2026-06-01"),
				care("pothos", "watering", "2026-06-05"),
				care("calathea", "watering", "2026-06-09"),
			],
		);
		const watering = sectionsByType.get("watering");
		expect(plantIds(watering?.due)).toEqual(["raven", "monstera"]);
		expect(plantIds(watering?.upcoming)).toEqual([
			"pothos",
			"ficus",
			"calathea",
		]);
	});

	it("puts the cares without a due date at the end of the upcoming ones", () => {
		const { sectionsByType } = run(
			[plant("raven"), plant("monstera")],
			[
				care("raven", "treatment", null, { frequency: null }),
				care("monstera", "treatment", "2026-06-05"),
			],
		);
		const treatment = sectionsByType.get("treatment");
		expect(plantIds(treatment?.upcoming)).toEqual(["monstera", "raven"]);
		expect(treatment?.upcoming[1]?.dueDate).toBeNull();
	});

	it("moves a care done today to its own section, with its log", () => {
		const { sectionsByType } = run(
			[plant("raven"), plant("monstera")],
			[
				care("raven", "watering", TODAY),
				care("monstera", "watering", "2026-06-01"),
			],
			[careLog("raven", "watering")],
		);
		const watering = sectionsByType.get("watering");
		expect(plantIds(watering?.handledToday)).toEqual(["raven"]);
		expect(watering?.handledToday[0]?.handledLog?.id).toBe(
			"log-raven-watering",
		);
		expect(plantIds(watering?.due)).toEqual(["monstera"]);
		expect(watering?.upcoming).toEqual([]);
	});

	it("keeps a care handled on another day on its schedule", () => {
		const { sectionsByType } = run(
			[plant("raven")],
			[care("raven", "watering", "2026-06-09")],
			[careLog("raven", "watering", "2026-06-09")],
		);
		const watering = sectionsByType.get("watering");
		expect(watering?.handledToday).toEqual([]);
		expect(plantIds(watering?.upcoming)).toEqual(["raven"]);
	});

	it("gives the progress towards the due date", () => {
		const { sectionsByType } = run(
			[plant("raven")],
			[care("raven", "watering", "2026-06-08")],
		);
		expect(sectionsByType.get("watering")?.upcoming[0]?.progress).toBeCloseTo(
			2 / 7,
		);
	});

	it("counts the cares of every type, by section", () => {
		const { counts } = run(
			[plant("raven"), plant("monstera")],
			[
				care("raven", "watering", "2026-06-01"),
				care("raven", "pruning", "2026-06-01"),
				care("monstera", "watering", TODAY),
				care("monstera", "misting", "2026-06-09"),
			],
			[careLog("monstera", "watering")],
		);
		expect(counts).toEqual({ due: 2, done: 1, skipped: 0, upcoming: 1 });
	});

	it("is empty without plants", () => {
		expect(run([], [])).toEqual({
			types: [],
			sectionsByType: new Map(),
			counts: { due: 0, done: 0, skipped: 0, upcoming: 0 },
		});
	});
});
