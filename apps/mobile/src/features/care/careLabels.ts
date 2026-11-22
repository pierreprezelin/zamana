import { careStatus } from "@/features/care/careSchedule";
import type { Care, CareLog, CareType } from "@/features/care/careTypes";
import { formatAge } from "@/features/plants/age";
import { needs } from "@/features/plants/plantOptions";
import { formatTime, parseISODate, toISODate } from "@/utils/dates";
import { locale, lowerFirst, pluralForm, t } from "@/utils/i18n";

// Beyond a month, a due date reads better as a month
const DAYS_SHOWN = 30;

export const careName = (type: CareType) => t(`care.types.${type}.name`);
export const careVerb = (type: CareType) => t(`care.types.${type}.verb`);
export const careActionLabel = ({ type, outcome }: CareLog) =>
	t(`care.types.${type}.${outcome}`);

const monthName = (month: number) =>
	new Date(2000, month - 1, 1).toLocaleDateString(locale(), { month: "long" });

const wateringDetails = needs.find((need) => need.key === "watering")?.details;

export const frequencyLabel = (care: Care, wateringLevel: number) => {
	if (care.type === "watering")
		return wateringDetails?.[wateringLevel - 1] ?? "";
	if (!care.frequency) return t("care.frequency.none");
	const { amount, unit } = care.frequency;
	const frequency = t(`care.frequency.${unit}.${pluralForm(amount)}`, {
		amount,
	});
	if (!care.period) return frequency;
	return t("care.frequency.withPeriod", {
		frequency,
		start: monthName(care.period.startMonth),
		end: monthName(care.period.endMonth),
	});
};

export const dueLabel = (dueDate: string, today: string) => {
	const status = careStatus(dueDate, today);
	if (status.kind === "late") {
		return t(`care.due.late.${pluralForm(status.days)}`, {
			amount: status.days,
		});
	}
	if (status.kind === "today") return t("care.due.today");
	if (status.days === 1) return t("care.due.tomorrow");
	if (status.days <= DAYS_SHOWN) {
		return t("care.due.inDays", { amount: status.days });
	}
	const month = parseISODate(dueDate).toLocaleDateString(locale(), {
		month: "long",
		year: "numeric",
	});
	return t("care.due.inMonth", { month });
};

export const lastDoneLabel = (lastDoneAt: string | null, now: Date) => {
	if (!lastDoneAt) return t("care.lastDone.never");
	if (lastDoneAt === toISODate(now)) return t("care.lastDone.today");
	return t("care.lastDone.ago", { age: formatAge(lastDoneAt, now) });
};

export const careSubtitle = (care: Care, wateringLevel: number, now: Date) => {
	const frequency = frequencyLabel(care, wateringLevel);
	return `${lastDoneLabel(care.lastDoneAt, now)} · ${lowerFirst(frequency)}`;
};

export const doneAtLabel = (createdAt: string) => {
	const date = new Date(createdAt);
	return t("care.doneAt", {
		time: formatTime(date.getHours(), date.getMinutes()),
	});
};

export const handledLabel = (
	log: CareLog,
	dueDate: string | null,
	today: string,
) => {
	if (log.outcome === "done") return doneAtLabel(log.createdAt);
	return dueDate
		? t("care.skippedNext", {
				due: lowerFirst(dueLabel(dueDate, today)),
			})
		: t("care.skipped");
};

export const plantTasksSummary = (
	pending: number,
	done: number,
	skipped: number,
) =>
	[
		pending &&
			t(`care.summary.pending.${pluralForm(pending)}`, { amount: pending }),
		done && t(`care.summary.done.${pluralForm(done)}`, { amount: done }),
		skipped &&
			t(`care.summary.skipped.${pluralForm(skipped)}`, { amount: skipped }),
	]
		.filter(Boolean)
		.join(" · ");
