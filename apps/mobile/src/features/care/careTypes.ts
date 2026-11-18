export const CARE_TYPES = [
	"watering",
	"fertilizing",
	"leafCleaning",
	"repotting",
	"pruning",
	"treatment",
	"misting",
] as const;
export const FREQUENCY_UNITS = ["day", "week", "month", "year"] as const;
export const CLIMATES = ["north", "south", "tropics"] as const;
export const CARE_OUTCOMES = ["done", "skipped"] as const;

export type CareType = (typeof CARE_TYPES)[number];
export type FrequencyUnit = (typeof FREQUENCY_UNITS)[number];
export type Climate = (typeof CLIMATES)[number];
export type CareOutcome = (typeof CARE_OUTCOMES)[number];

export type Frequency = { amount: number; unit: FrequencyUnit };
// Months from 1 to 12, the period may wrap around the new year
export type Period = { startMonth: number; endMonth: number };

export type Care = {
	id: string;
	plantId: string;
	type: CareType;
	// Watering has none, its interval comes from the plant's watering level
	frequency: Frequency | null;
	period: Period | null;
	lastDoneAt: string | null;
	startedAt: string;
	snoozedUntil: string | null;
	reminder: boolean;
};

export type CareLog = {
	id: string;
	plantId: string;
	type: CareType;
	outcome: CareOutcome;
	date: string;
	createdAt: string;
	previousLastDoneAt: string | null;
	previousSnoozedUntil: string | null;
};
