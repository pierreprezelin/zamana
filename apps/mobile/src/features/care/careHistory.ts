import type { Care, CareLog } from "@/features/care/careTypes";

// Undoing restores the schedule saved by the action, which only holds while the care
// still has the schedule this action left: its latest action, on the same tracking, not edited since.
export const undoableLogIds = (logs: CareLog[], cares: Care[]) => {
	const latestByCare = new Map<string, CareLog>();
	for (const log of logs) {
		const key = `${log.plantId}:${log.type}`;
		const latest = latestByCare.get(key);
		if (!latest || log.createdAt > latest.createdAt) latestByCare.set(key, log);
	}

	const undoable = new Set<string>();
	for (const log of latestByCare.values()) {
		const care = cares.find(
			(care) => care.plantId === log.plantId && care.type === log.type,
		);
		if (!care || log.date < care.startedAt) continue;
		const lastDoneAtLeft =
			log.outcome === "done" ? log.date : log.previousLastDoneAt;
		if (care.lastDoneAt === lastDoneAtLeft) undoable.add(log.id);
	}
	return undoable;
};
