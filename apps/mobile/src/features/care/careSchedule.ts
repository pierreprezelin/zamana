import type {
	Care,
	CareLog,
	Climate,
	Frequency,
	Period,
} from "@/features/care/careTypes";
import { parseISODate, toISODate } from "@/utils/dates";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Growing season low bound, rest season high bound, by watering level
const WATERING_DAYS: Record<number, [growing: number, resting: number]> = {
	1: [2, 3],
	2: [7, 14],
	3: [30, 45],
};

// April to September in the north
const NORTH_GROWING_MONTHS = [4, 5, 6, 7, 8, 9];

export type ScheduleContext = { wateringLevel: number; climate: Climate };

export type CareStatus =
	| { kind: "late"; days: number }
	| { kind: "today" }
	| { kind: "upcoming"; days: number };

const daysBetween = (from: string, to: string) =>
	Math.round(
		(parseISODate(to).getTime() - parseISODate(from).getTime()) / DAY_IN_MS,
	);

const addDays = (isoDate: string, days: number) => {
	const date = parseISODate(isoDate);
	date.setDate(date.getDate() + days);
	return toISODate(date);
};

// Keeps the end of a shorter month: January 31 plus a month is February 28
const addMonths = (isoDate: string, months: number) => {
	const date = parseISODate(isoDate);
	const day = date.getDate();
	date.setDate(1);
	date.setMonth(date.getMonth() + months);
	const lastDay = new Date(
		date.getFullYear(),
		date.getMonth() + 1,
		0,
	).getDate();
	date.setDate(Math.min(day, lastDay));
	return toISODate(date);
};

const addFrequency = (isoDate: string, { amount, unit }: Frequency) => {
	if (unit === "day") return addDays(isoDate, amount);
	if (unit === "week") return addDays(isoDate, amount * 7);
	if (unit === "month") return addMonths(isoDate, amount);
	return addMonths(isoDate, amount * 12);
};

const monthOf = (isoDate: string) => parseISODate(isoDate).getMonth() + 1;

const isGrowingSeason = (isoDate: string, climate: Climate) => {
	if (climate === "tropics") return true;
	const month = monthOf(isoDate);
	const northMonth = climate === "south" ? ((month + 5) % 12) + 1 : month;
	return NORTH_GROWING_MONTHS.includes(northMonth);
};

export const wateringIntervalDays = (
	level: number,
	isoDate: string,
	climate: Climate,
) => {
	const [growing, resting] = WATERING_DAYS[level];
	return isGrowingSeason(isoDate, climate) ? growing : resting;
};

// One interval after the given date, or null for a care with no frequency
const afterOneInterval = (
	care: Care,
	from: string,
	{ wateringLevel, climate }: ScheduleContext,
) => {
	if (care.type === "watering") {
		return addDays(from, wateringIntervalDays(wateringLevel, from, climate));
	}
	return care.frequency ? addFrequency(from, care.frequency) : null;
};

const isInPeriod = (month: number, { startMonth, endMonth }: Period) =>
	startMonth <= endMonth
		? month >= startMonth && month <= endMonth
		: month >= startMonth || month <= endMonth;

const intoPeriod = (isoDate: string, period: Period) => {
	const month = monthOf(isoDate);
	if (isInPeriod(month, period)) return isoDate;
	const year = parseISODate(isoDate).getFullYear();
	const startYear = period.startMonth > month ? year : year + 1;
	return toISODate(new Date(startYear, period.startMonth - 1, 1));
};

const reference = (care: Care) => care.lastDoneAt ?? care.startedAt;

// Given today, a late care waits outside its period instead of staying late
export const nextDueDate = (
	care: Care,
	context: ScheduleContext,
	today?: string,
) => {
	const afterInterval = afterOneInterval(care, reference(care), context);
	if (!afterInterval) return null;
	// Waiting a month or a year for a care never done would forget it: ask right away.
	// Watering keeps its first reminder one interval away
	const askNow =
		care.type !== "watering" &&
		!care.lastDoneAt &&
		afterInterval >= addMonths(care.startedAt, 1);
	const due = askNow ? care.startedAt : afterInterval;
	const snoozed =
		care.snoozedUntil && care.snoozedUntil > due ? care.snoozedUntil : due;
	if (!care.period) return snoozed;
	const inPeriod = intoPeriod(snoozed, care.period);
	const pausedToday =
		today && inPeriod < today && !isInPeriod(monthOf(today), care.period);
	return pausedToday ? intoPeriod(today, care.period) : inPeriod;
};

// The log keeps the care as it was, so it tells a due care from one done ahead
export const wasDueWhenDone = (
	care: Care,
	log: CareLog,
	context: ScheduleContext,
	today: string,
) =>
	isDue(
		nextDueDate(
			{
				...care,
				lastDoneAt: log.previousLastDoneAt,
				snoozedUntil: log.previousSnoozedUntil,
			},
			context,
			today,
		),
		today,
	);

export type ScheduledCare = { care: Care; dueDate: string | null };

// Soonest first, the cares without a due date last
export const scheduleCares = (
	cares: Care[],
	context: ScheduleContext,
	today: string,
): ScheduledCare[] =>
	cares
		.map((care) => ({ care, dueDate: nextDueDate(care, context, today) }))
		.sort((a, b) =>
			a.dueDate && b.dueDate
				? a.dueDate.localeCompare(b.dueDate)
				: Number(!a.dueDate) - Number(!b.dueDate),
		);

export const isDue = (dueDate: string | null, today: string) =>
	dueDate !== null && dueDate <= today;

// "Not needed" asks again after a quarter of the interval, at least a day later
export const snoozeUntil = (
	care: Care,
	today: string,
	context: ScheduleContext,
) => {
	const intervalEnd = afterOneInterval(care, today, context) ?? today;
	const days = Math.max(1, Math.round(daysBetween(today, intervalEnd) / 4));
	return addDays(today, days);
};

export const careStatus = (dueDate: string, today: string): CareStatus => {
	const days = daysBetween(today, dueDate);
	if (days < 0) return { kind: "late", days: -days };
	if (days === 0) return { kind: "today" };
	return { kind: "upcoming", days };
};

export const careProgress = (
	care: Care,
	today: string,
	context: ScheduleContext,
) => {
	const start = reference(care);
	const end = nextDueDate(care, context, today);
	if (!end) return null;
	const total = daysBetween(start, end);
	return total > 0 ? Math.min(1, daysBetween(start, today) / total) : 1;
};
