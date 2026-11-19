import { undoableLogIds } from "@/features/care/careHistory";
import {
	isDue,
	type ScheduleContext,
	scheduleCares,
} from "@/features/care/careSchedule";
import type { Care, CareLog } from "@/features/care/careTypes";
import { handledTodayLog } from "@/features/care/todayTasks";

type PlantCareInput = {
	cares: Care[];
	logs: CareLog[];
	context: ScheduleContext;
	today: string;
};

// The sections of a plant care tab: a care handled today shows both in "to do" and "upcoming"
export const plantCareSections = ({
	cares,
	logs,
	context,
	today,
}: PlantCareInput) => {
	const undoable = undoableLogIds(logs, cares);
	const scheduled = scheduleCares(cares, context, today).map((entry) => ({
		...entry,
		handledLog: handledTodayLog(logs, entry.care, today, undoable),
	}));
	const handledToday = scheduled.filter(
		(entry): entry is typeof entry & { handledLog: CareLog } =>
			entry.handledLog !== undefined,
	);
	const due = scheduled.filter(
		(entry): entry is typeof entry & { dueDate: string } =>
			!entry.handledLog && isDue(entry.dueDate, today),
	);
	const upcoming = scheduled.filter(
		(entry) => entry.handledLog || !isDue(entry.dueDate, today),
	);
	const next = upcoming.find(({ dueDate }) => dueDate);
	return { due, handledToday, upcoming, next };
};
