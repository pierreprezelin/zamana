import { undoableLogIds } from "@/features/care/careHistory";
import type { Care, CareLog } from "@/features/care/careTypes";

const care = (overrides: Partial<Care> = {}): Care => ({
	id: "care-1",
	plantId: "plant-1",
	type: "watering",
	frequency: null,
	period: null,
	lastDoneAt: "2026-06-05",
	startedAt: "2026-01-01",
	snoozedUntil: null,
	reminder: true,
	...overrides,
});

const log = (
	id: string,
	date: string,
	overrides: Partial<CareLog> = {},
): CareLog => ({
	id,
	plantId: "plant-1",
	type: "watering",
	outcome: "done",
	date,
	createdAt: `${date}T08:00:00.000Z`,
	previousLastDoneAt: null,
	previousSnoozedUntil: null,
	...overrides,
});

const undoable = (logs: CareLog[], cares: Care[] = [care()]) => [
	...undoableLogIds(logs, cares),
];

describe("undoableLogIds", () => {
	it("only lets the latest action of each care be undone", () => {
		expect(
			undoable(
				[
					log("old", "2026-06-01"),
					log("latest", "2026-06-05"),
					log("feeding", "2026-06-02", { type: "fertilizing" }),
				],
				[
					care(),
					care({ id: "care-2", type: "fertilizing", lastDoneAt: "2026-06-02" }),
				],
			),
		).toEqual(["latest", "feeding"]);
	});

	it("tracks the latest action of each plant on its own", () => {
		expect(
			undoable(
				[
					log("pilea", "2026-06-05"),
					log("ficus", "2026-06-06", { plantId: "plant-2" }),
				],
				[
					care(),
					care({ id: "care-2", plantId: "plant-2", lastDoneAt: "2026-06-06" }),
				],
			),
		).toEqual(["pilea", "ficus"]);
	});

	it("locks a done care once it has been skipped since", () => {
		expect(
			undoable([
				log("done", "2026-06-05"),
				log("skipped", "2026-06-08", {
					outcome: "skipped",
					previousLastDoneAt: "2026-06-05",
				}),
			]),
		).toEqual(["skipped"]);
	});

	it("locks an action whose last done date was edited since", () => {
		expect(
			undoable(
				[log("done", "2026-06-05")],
				[care({ lastDoneAt: "2026-06-09" })],
			),
		).toEqual([]);
	});

	it("locks the actions of a care started again since", () => {
		expect(
			undoable(
				[log("old", "2026-06-05")],
				[care({ startedAt: "2026-06-07", lastDoneAt: "2026-06-05" })],
			),
		).toEqual([]);
	});

	it("locks the actions of a stopped care, nothing is left to restore", () => {
		expect(undoable([log("old", "2026-06-05")], [])).toEqual([]);
	});
});
