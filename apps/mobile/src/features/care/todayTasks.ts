import { undoableLogIds } from "@/features/care/careHistory";
import {
	type CareStatus,
	careStatus,
	isDue,
	scheduleCares,
	wasDueWhenDone,
} from "@/features/care/careSchedule";
import type { Care, CareLog, Climate } from "@/features/care/careTypes";
import type { Plant } from "@/features/plants/plantSchema";

export type TodayTask = {
	care: Care;
	dueDate: string;
	status: CareStatus;
	// Set when the care was done or skipped today, so it can be undone
	handledLog?: CareLog;
};

export type TodayGroup = {
	plant: Plant;
	tasks: TodayTask[];
	pendingCount: number;
	doneCount: number;
	skippedCount: number;
	// Done today while due, as opposed to ahead of time
	dueDoneCount: number;
};

type HandledTask = TodayTask & { handledLog: CareLog };

type TodayInput = {
	plants: Plant[];
	cares: Care[];
	logs: CareLog[];
	today: string;
	climate: Climate;
};

// The care is done or skipped for the day: it stays listed, and can be undone.
// Once it can no longer be undone, it is shown on its schedule again
export const handledTodayLog = (
	logs: CareLog[],
	care: Care,
	today: string,
	undoable: Set<string>,
) =>
	logs.findLast(
		(log) =>
			log.date === today &&
			log.plantId === care.plantId &&
			log.type === care.type &&
			undoable.has(log.id),
	);

export const todayTasks = ({
	plants,
	cares,
	logs,
	today,
	climate,
}: TodayInput): TodayGroup[] => {
	const undoable = undoableLogIds(logs, cares);
	const groups = plants
		.filter((plant) => !plant.archivedAt)
		.map((plant) => {
			const context = { wateringLevel: plant.watering, climate };
			const pending: TodayTask[] = [];
			const handled: HandledTask[] = [];
			const plantCares = cares.filter((care) => care.plantId === plant.id);
			for (const { care, dueDate } of scheduleCares(
				plantCares,
				context,
				today,
			)) {
				if (!dueDate) continue;
				const handledLog = handledTodayLog(logs, care, today, undoable);
				const task = { care, dueDate, status: careStatus(dueDate, today) };
				if (handledLog) handled.push({ ...task, handledLog });
				else if (isDue(dueDate, today)) pending.push(task);
			}
			const done = handled.filter((task) => task.handledLog.outcome === "done");
			return {
				plant,
				tasks: [...pending, ...handled],
				pendingCount: pending.length,
				doneCount: done.length,
				skippedCount: handled.length - done.length,
				dueDoneCount: done.filter((task) =>
					wasDueWhenDone(task.care, task.handledLog, context, today),
				).length,
			};
		})
		.filter((group) => group.tasks.length);

	// The plant waiting the longest comes first
	const oldestDueDate = (group: TodayGroup) =>
		group.tasks.reduce(
			// biome-ignore lint/complexity/useMathMinMax: ISO date strings, Math.min would coerce them to NaN
			(oldest, task) => (task.dueDate < oldest ? task.dueDate : oldest),
			today,
		);
	return groups.sort((a, b) =>
		oldestDueDate(a).localeCompare(oldestDueDate(b)),
	);
};
