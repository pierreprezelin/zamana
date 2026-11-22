import { locale, t } from "@/utils/i18n";

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

const atTime = (hours: number, minutes = 0) =>
	new Date(2000, 0, 1, hours, minutes);

// French writes "9 h 05", Intl would give "09:05"
export const formatTime = (hours: number, minutes: number) =>
	locale() === "fr"
		? `${hours} h ${pad(minutes)}`
		: atTime(hours, minutes).toLocaleTimeString(locale(), {
				hour: "numeric",
				minute: "2-digit",
			});

export const formatHour = (hours: number) =>
	locale() === "fr"
		? `${hours} h`
		: atTime(hours).toLocaleTimeString(locale(), { hour: "numeric" });

export const formatDateTime = (timestamp: string) => {
	const date = new Date(timestamp);
	return t("common.dateTime", {
		date: formatDate(toISODate(date)),
		time: formatTime(date.getHours(), date.getMinutes()),
	});
};
