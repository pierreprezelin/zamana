import { locale } from "@/utils/i18n";

// Local hours and minutes, like "09:00"
export type ReminderTime = `${number}:${number}`;

export const DEFAULT_REMINDER_TIME: ReminderTime = "09:00";

export const isReminderTime = (value: unknown): value is ReminderTime =>
	typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const atReminderTime = (
	time: ReminderTime,
	day: Date,
	dayOffset = 0,
) => {
	const [hours, minutes] = time.split(":").map(Number);
	return new Date(
		day.getFullYear(),
		day.getMonth(),
		day.getDate() + dayOffset,
		hours,
		minutes,
	);
};

export const toReminderTime = (date: Date) =>
	[date.getHours(), date.getMinutes()]
		.map((part) => String(part).padStart(2, "0"))
		.join(":") as ReminderTime;

export const formatReminderTime = (time: ReminderTime) =>
	atReminderTime(time, new Date()).toLocaleTimeString(locale(), {
		hour: "2-digit",
		minute: "2-digit",
	});
