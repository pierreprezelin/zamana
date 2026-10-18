import { locale } from "@/utils/i18n";

const pad = (value: number) => String(value).padStart(2, "0");

// Local date, toISOString would shift it to UTC
export const toISODate = (date: Date) =>
	`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseISODate = (isoDate: string) => {
	const [year, month, day] = isoDate.split("-").map(Number);
	return new Date(year, month - 1, day);
};

export const formatDate = (isoDate: string) =>
	parseISODate(isoDate).toLocaleDateString(locale(), {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
