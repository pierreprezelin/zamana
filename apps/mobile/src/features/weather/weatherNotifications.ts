import type { Digest } from "@/features/notifications/dailyDigests";
import {
	atReminderTime,
	type ReminderTime,
} from "@/features/notifications/reminderTime";
import type { Plant } from "@/features/plants/plantSchema";
import { weatherAlert } from "@/features/weather/weatherLabels";
import { weatherRisks } from "@/features/weather/weatherRisks";
import type { Forecast } from "@/features/weather/weatherTypes";
import { toISODate } from "@/utils/dates";

// Rescheduled on each forecast: further ahead, it would only grow less reliable
const WEATHER_DAYS_AHEAD = 3;
const WEATHER_WINDOW_HOURS = 24;
const HOUR_MS = 60 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, "0");

// The forecast hours are local times: "2026-11-20T18:00"
const toLocalTime = (date: Date) =>
	`${toISODate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const weatherWindow = (start: Date) => ({
	from: toLocalTime(start),
	to: toLocalTime(new Date(start.getTime() + WEATHER_WINDOW_HOURS * HOUR_MS)),
});

type WeatherNotificationInput = {
	forecast: Forecast | null;
	plants: Plant[];
	now: Date;
	alertTime: ReminderTime;
};

export const weatherNotifications = ({
	forecast,
	plants,
	now,
	alertTime,
}: WeatherNotificationInput): Digest[] => {
	const lastHour = forecast?.hours.at(-1)?.time;
	if (!forecast || !lastHour) return [];

	return Array.from({ length: WEATHER_DAYS_AHEAD }, (_, day) =>
		atReminderTime(alertTime, now, day),
	).flatMap((date): Digest[] => {
		if (date <= now) return [];
		const { from, to } = weatherWindow(date);
		// An hour the forecast does not know is not an hour without risk
		const lastNeeded = toLocalTime(
			new Date(date.getTime() + (WEATHER_WINDOW_HOURS - 1) * HOUR_MS),
		);
		if (lastHour < lastNeeded) return [];
		const risks = weatherRisks({ hours: forecast.hours, plants, from, to });
		if (!risks.length) return [];
		return [{ date, ...weatherAlert(risks, toISODate(date)) }];
	});
};
