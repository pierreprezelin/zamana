import type { Care, CareLog } from "@/features/care/careTypes";
import { todayTasks } from "@/features/care/todayTasks";
import type { Plant } from "@/features/plants/plantSchema";

const plant = (id: string, overrides: Partial<Plant> = {}) =>
	({ id, name: id, watering: 2, archivedAt: null, ...overrides }) as Plant;

const care = (
	plantId: string,
	type: Care["type"],
	lastDoneAt: string,
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
});

const careLog = (
	plantId: string,
	type: Care["type"],
	date = "2026-06-10",
	outcome: CareLog["outcome"] = "done",
): CareLog => ({
	id: `log-${plantId}-${type}`,
	plantId,
	type,
	outcome,
	date,
	createdAt: `${date}T09:42:00.000Z`,
	previousLastDoneAt: null,
	previousSnoozedUntil: null,
});

const run = (plants: Plant[], cares: Care[], logs: CareLog[] = []) =>
	todayTasks({ plants, cares, logs, today: "2026-06-10", climate: "north" });

describe("todayTasks", () => {
	it("lists the due and late cares, grouped by plant", () => {
		const groups = run(
			[plant("raven"), plant("monstera")],
			[
				care("raven", "watering", "2026-06-01"),
				care("raven", "pruning", "2026-06-03"),
				care("monstera", "watering", "2026-06-08"),
			],
		);

		expect(groups).toHaveLength(1);
		expect(groups[0].plant.id).toBe("raven");
		expect(
			groups[0].tasks.map((task) => [task.care.type, task.status]),
		).toEqual([
			["watering", { kind: "late", days: 2 }],
			["pruning", { kind: "today" }],
		]);
	});

	it("leaves archived plants out", () => {
		const groups = run(
			[plant("raven", { archivedAt: "2026-06-01T00:00:00.000Z" })],
			[care("raven", "watering", "2026-06-01")],
		);
		expect(groups).toEqual([]);
	});

	it("keeps the cares done today, with their log", () => {
		const groups = run(
			[plant("monstera")],
			[
				care("monstera", "watering", "2026-06-03"),
				care("monstera", "leafCleaning", "2026-06-10"),
			],
			[
				careLog("monstera", "leafCleaning"),
				careLog("monstera", "fertilizing", "2026-06-09"),
			],
		);

		expect(
			groups[0].tasks.map((task) => [task.care.type, task.handledLog?.id]),
		).toEqual([
			["watering", undefined],
			["leafCleaning", "log-monstera-leafCleaning"],
		]);
		expect(groups[0].pendingCount).toBe(1);
		expect(groups[0].doneCount).toBe(1);
		expect(groups[0].dueDoneCount).toBe(1);
	});

	it("keeps the cares skipped today, with their log, so they can be undone", () => {
		const skipped = {
			...care("monstera", "watering", "2026-06-03"),
			snoozedUntil: "2026-06-11",
		};
		const groups = run(
			[plant("monstera")],
			[skipped],
			[
				{
					...careLog("monstera", "watering", "2026-06-10", "skipped"),
					previousLastDoneAt: "2026-06-03",
				},
			],
		);

		expect(
			groups[0].tasks.map((task) => [task.care.type, task.handledLog?.id]),
		).toEqual([["watering", "log-monstera-watering"]]);
		expect(groups[0].pendingCount).toBe(0);
		expect(groups[0].doneCount).toBe(0);
		expect(groups[0].skippedCount).toBe(1);
		expect(groups[0].dueDoneCount).toBe(0);
	});

	it("leaves out an action of today that the care was edited since", () => {
		const edited = { ...care("monstera", "watering", "2026-06-09") };
		const groups = run(
			[plant("monstera")],
			[edited],
			[careLog("monstera", "watering", "2026-06-10", "skipped")],
		);
		expect(groups).toEqual([]);
	});

	it("leaves out the cares skipped on another day", () => {
		const skipped = {
			...care("monstera", "watering", "2026-06-03"),
			snoozedUntil: "2026-06-12",
		};
		const groups = run(
			[plant("monstera")],
			[skipped],
			[careLog("monstera", "watering", "2026-06-09", "skipped")],
		);
		expect(groups).toEqual([]);
	});

	it("shows the latest plants first", () => {
		const groups = run(
			[plant("a"), plant("b")],
			[
				care("a", "watering", "2026-06-03"),
				care("b", "watering", "2026-05-20"),
			],
		);
		expect(groups.map((group) => group.plant.id)).toEqual(["b", "a"]);
	});
});
