import type { CareLog } from "@/features/care/careTypes";
import type { HistoryEntry } from "@/features/history/historyTypes";
import { buildTimeline } from "@/features/history/timeline";

const entry = (
	id: string,
	createdAt: string,
	photo: string | null = null,
): HistoryEntry => ({
	id,
	plantId: "plant-1",
	photo,
	note: photo ? null : "Note",
	createdAt,
	updatedAt: createdAt,
});

const log = (
	id: string,
	createdAt: string,
	outcome: CareLog["outcome"] = "done",
): CareLog => ({
	id,
	plantId: "plant-1",
	type: "watering",
	outcome,
	date: createdAt.slice(0, 10),
	createdAt,
	previousLastDoneAt: null,
	previousSnoozedUntil: null,
});

const timeline = (showCares = true) =>
	buildTimeline({
		addedAt: "2026-09-15T06:47:00.000Z",
		entries: [
			entry("note", "2026-09-23T15:16:00.000Z"),
			entry("photo", "2026-09-22T12:20:00.000Z", "a.jpg"),
		],
		logs: [
			log("skipped", "2026-09-20T07:00:00.000Z", "skipped"),
			log("done", "2026-09-15T07:04:00.000Z"),
		],
		showCares,
		today: "2026-09-24",
	});

describe("buildTimeline", () => {
	it("merges entries and care actions from newest to oldest, the plant addition last", () => {
		expect(timeline().items.map((item) => item.id)).toEqual([
			"note",
			"photo",
			"skipped",
			"done",
			"added",
		]);
	});

	it("hides care actions on demand", () => {
		expect(timeline(false).items.map((item) => item.id)).toEqual([
			"note",
			"photo",
			"added",
		]);
	});

	it("sums up the whole history, whatever the filter", () => {
		expect(timeline(false).summary).toEqual({
			entries: 2,
			photos: 1,
			cares: 1,
			days: 9,
		});
	});
});
