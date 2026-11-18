import {
	type CareStatus,
	careStatus,
	isDue,
	scheduleCares,
} from "@/features/care/careSchedule";
import type { Care, CareLog, Climate } from "@/features/care/careTypes";
import type { Plant } from "@/features/plants/plantSchema";

export type TodayTask = {
	care: Care;
	dueDate: string;
	status: CareStatus;
	// Set when the care was done today, so it can be undone
	doneLog?: CareLog;
};

export type TodayGroup = {
	plant: Plant;
	tasks: TodayTask[];
	pendingCount: number;
	doneCount: number;
};

type TodayInput = {
	plants: Plant[];
	cares: Care[];
	logs: CareLog[];
	today: string;
	climate: Climate;
};

export const todayTasks = ({
	plants,
	cares,
	logs,
	today,
	climate,
}: TodayInput): TodayGroup[] => {
	const doneToday = logs.filter(
		(log) => log.outcome === "done" && log.date === today,
	);

	const groups = plants
		.filter((plant) => !plant.archivedAt)
		.map((plant) => {
			const context = { wateringLevel: plant.watering, climate };
			const pending: TodayTask[] = [];
			const done: TodayTask[] = [];
			const plantCares = cares.filter((care) => care.plantId === plant.id);
			for (const { care, dueDate } of scheduleCares(
				plantCares,
				context,
				today,
			)) {
				if (!dueDate) continue;
				const doneLog = doneToday.findLast(
					(log) => log.plantId === care.plantId && log.type === care.type,
				);
				const task = { care, dueDate, status: careStatus(dueDate, today) };
				if (doneLog) done.push({ ...task, doneLog });
				else if (isDue(dueDate, today)) pending.push(task);
			}
			return {
				plant,
				tasks: [...pending, ...done],
				pendingCount: pending.length,
				doneCount: done.length,
			};
		})
		.filter((group) => group.tasks.length);

	// The plant waiting the longest comes first
	const oldestDueDate = (group: TodayGroup) =>
		group.tasks.reduce(
			(oldest, task) => (task.dueDate < oldest ? task.dueDate : oldest),
			today,
		);
	return groups.sort((a, b) =>
		oldestDueDate(a).localeCompare(oldestDueDate(b)),
	);
};
