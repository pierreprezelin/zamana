import type { Age, AgeUnit } from "@/features/plants/plantSchema";
import { parseISODate, toISODate } from "@/utils/dates";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const ageToBornAt = ({ amount, unit }: Age, now: Date) => {
	const bornAt = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	if (unit === "day") bornAt.setDate(bornAt.getDate() - amount);
	if (unit === "month") bornAt.setMonth(bornAt.getMonth() - amount);
	if (unit === "year") bornAt.setFullYear(bornAt.getFullYear() - amount);
	return toISODate(bornAt);
};

// Expressed in the largest whole unit, so 18 months become 1 year
export const bornAtToAge = (bornAt: string, now: Date): Age => {
	const born = parseISODate(bornAt);
	const months =
		(now.getFullYear() - born.getFullYear()) * 12 +
		now.getMonth() -
		born.getMonth() -
		(now.getDate() < born.getDate() ? 1 : 0);

	if (months >= 12) return { amount: Math.floor(months / 12), unit: "year" };
	if (months >= 1) return { amount: months, unit: "month" };

	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const days = Math.round((today.getTime() - born.getTime()) / DAY_IN_MS);
	return { amount: Math.max(days, 1), unit: "day" };
};

const unitLabels: Record<AgeUnit, [singular: string, plural: string]> = {
	day: ["jour", "jours"],
	month: ["mois", "mois"],
	year: ["an", "ans"],
};

export const formatAge = (bornAt: string, now: Date) => {
	const { amount, unit } = bornAtToAge(bornAt, now);
	const [singular, plural] = unitLabels[unit];
	return `${amount} ${amount > 1 ? plural : singular}`;
};

// Keeps the stored date when the age is untouched, as the prefilled age is rounded
export const resolveBornAt = (
	age: Age | null,
	previousBornAt: string | null,
	now: Date,
) => {
	if (!age) return null;
	if (previousBornAt) {
		const previousAge = bornAtToAge(previousBornAt, now);
		if (previousAge.amount === age.amount && previousAge.unit === age.unit) {
			return previousBornAt;
		}
	}
	return ageToBornAt(age, now);
};
