import { undoableLogIds } from "@/features/care/careHistory";
import {
	bySoonestDueDate,
	careProgress,
	isDue,
	nextDueDate,
} from "@/features/care/careSchedule";
import {
	CARE_TYPES,
	type Care,
	type CareLog,
	type CareType,
	type Climate,
} from "@/features/care/careTypes";
import { handledTodayLog } from "@/features/care/todayTasks";
import type { Plant } from "@/features/plants/plantSchema";

export type CareOverviewEntry = {
	plant: Plant;
	care: Care;
	dueDate: string | null;
	progress: number | null;
	handledLog?: CareLog;
};

export type CareOverviewSections = {
	due: CareOverviewEntry[];
	handledToday: CareOverviewEntry[];
	upcoming: CareOverviewEntry[];
};

type CareOverviewInput = {
	plants: Plant[];
	cares: Care[];
	logs: CareLog[];
	today: string;
	climate: Climate;
};

// Every current plant's care, by type, in the order of the care settings
export const careOverview = ({
	plants,
	cares,
	logs,
	today,
	climate,
}: CareOverviewInput) => {
	const undoable = undoableLogIds(logs, cares);
	const currentPlants = new Map(
		plants
			.filter((plant) => !plant.archivedAt)
			.map((plant) => [plant.id, plant]),
	);
	const entries = cares.flatMap((care): CareOverviewEntry[] => {
		const plant = currentPlants.get(care.plantId);
		if (!plant) return [];
		const context = { wateringLevel: plant.watering, climate };
		return [
			{
				plant,
				care,
				dueDate: nextDueDate(care, context, today),
				progress: careProgress(care, today, context),
				handledLog: handledTodayLog(logs, care, today, undoable),
			},
		];
	});
	entries.sort(bySoonestDueDate);

	const sectionsByType = new Map<CareType, CareOverviewSections>();
	for (const type of CARE_TYPES) {
		const ofType = entries.filter((entry) => entry.care.type === type);
		if (!ofType.length) continue;
		const pending = ofType.filter((entry) => !entry.handledLog);
		sectionsByType.set(type, {
			due: pending.filter((entry) => isDue(entry.dueDate, today)),
			handledToday: ofType.filter((entry) => entry.handledLog),
			upcoming: pending.filter((entry) => !isDue(entry.dueDate, today)),
		});
	}

	const counts = { due: 0, done: 0, skipped: 0, upcoming: 0 };
	for (const { due, handledToday, upcoming } of sectionsByType.values()) {
		const done = handledToday.filter(
			(entry) => entry.handledLog?.outcome === "done",
		).length;
		counts.due += due.length;
		counts.done += done;
		counts.skipped += handledToday.length - done;
		counts.upcoming += upcoming.length;
	}

	return { types: [...sectionsByType.keys()], sectionsByType, counts };
};
