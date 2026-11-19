import { careVerb } from "@/features/care/careLabels";
import { scheduleCares } from "@/features/care/careSchedule";
import {
	CARE_TYPES,
	type Care,
	type CareType,
	type Climate,
} from "@/features/care/careTypes";
import {
	atReminderTime,
	type ReminderTime,
} from "@/features/notifications/reminderTime";
import { displayName } from "@/features/plants/plantLabels";
import type { Plant } from "@/features/plants/plantSchema";
import { toISODate } from "@/utils/dates";
import { pluralForm, t } from "@/utils/i18n";

export const DIGEST_DAYS = 30;

export type Digest = { date: Date; title: string; body: string };

type DigestInput = {
	plants: Plant[];
	cares: Care[];
	climate: Climate;
	now: Date;
	reminderTime: ReminderTime;
};

// The system shows a line or two: the rest would only weigh on the bridge
const NAMED_PLANTS = 3;

const digestBody = (verbsByPlant: Map<Plant, string[]>) => {
	const named = [...verbsByPlant]
		.slice(0, NAMED_PLANTS)
		.map(([plant, verbs]) => `${displayName(plant)} · ${verbs.join(", ")}`)
		.join(", ");
	const others = verbsByPlant.size - NAMED_PLANTS;
	return others > 0
		? `${named} ${t(`notifications.digest.morePlants.${pluralForm(others)}`, { amount: others })}`
		: named;
};

// Assumes nothing gets done meanwhile: a late care stays in every digest
export const dailyDigests = ({
	plants,
	cares,
	climate,
	now,
	reminderTime,
}: DigestInput): Digest[] => {
	const today = toISODate(now);
	const caresByPlant = new Map<string, Care[]>();
	for (const care of cares) {
		if (!care.reminder) continue;
		caresByPlant.set(care.plantId, [
			...(caresByPlant.get(care.plantId) ?? []),
			care,
		]);
	}
	const scheduled = plants
		.filter((plant) => !plant.archivedAt)
		.flatMap((plant) =>
			scheduleCares(
				caresByPlant.get(plant.id) ?? [],
				{ wateringLevel: plant.watering, climate },
				today,
			).flatMap(({ care, dueDate }) =>
				dueDate ? [{ care, plant, dueDate }] : [],
			),
		)
		.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
	if (!scheduled.length) return [];

	const verbs = Object.fromEntries(
		CARE_TYPES.map((type) => [type, careVerb(type)]),
	) as Record<CareType, string>;
	// Sorted by due date, the due cares of a day extend those of the day before
	const verbsByPlant = new Map<Plant, string[]>();
	let dueCount = 0;
	const firstDay = atReminderTime(reminderTime, now) > now ? 0 : 1;
	const digests: Digest[] = [];
	for (let offset = firstDay; offset < firstDay + DIGEST_DAYS; offset++) {
		const date = atReminderTime(reminderTime, now, offset);
		const day = toISODate(date);
		while (dueCount < scheduled.length && scheduled[dueCount].dueDate <= day) {
			const { care, plant } = scheduled[dueCount++];
			verbsByPlant.set(plant, [
				...(verbsByPlant.get(plant) ?? []),
				verbs[care.type],
			]);
		}
		if (!dueCount) continue;
		digests.push({
			date,
			title: t(`notifications.digest.title.${pluralForm(dueCount)}`, {
				amount: dueCount,
			}),
			body: digestBody(verbsByPlant),
		});
	}
	digests.push({
		date: atReminderTime(reminderTime, now, firstDay + DIGEST_DAYS),
		title: t("notifications.paused.title"),
		body: t("notifications.paused.body"),
	});
	return digests;
};
