import type { Plant } from "@/features/plants/plantSchema";
import { weatherAlert } from "@/features/weather/weatherLabels";
import { weatherNotifications } from "@/features/weather/weatherNotifications";
import { weatherRisks } from "@/features/weather/weatherRisks";
import type { Forecast, ForecastHour } from "@/features/weather/weatherTypes";

const basil = {
	id: "basil",
	name: "Basilic",
	nickname: null,
	temperature: 2,
	outdoor: true,
	archivedAt: null,
} as Plant;

const pad = (value: number) => String(value).padStart(2, "0");

// Four mild days from 2026-11-20, then the given hours replaced
const forecast = (overrides: Record<string, Partial<ForecastHour>> = {}) => {
	const hours: ForecastHour[] = [];
	for (let day = 20; day < 24; day++) {
		for (let hour = 0; hour < 24; hour++) {
			const time = `2026-11-${day}T${pad(hour)}:00`;
			hours.push({
				time,
				temperature: 12,
				gusts: 20,
				code: 1,
				...overrides[time],
			});
		}
	}
	return { fetchedAt: "2026-11-20T08:00:00.000Z", hours } satisfies Forecast;
};

const frosty = (...times: string[]) =>
	forecast(
		Object.fromEntries(times.map((time) => [time, { temperature: -2 }])),
	);

const run = (input: Partial<Parameters<typeof weatherNotifications>[0]>) =>
	weatherNotifications({
		forecast: forecast(),
		plants: [basil],
		now: new Date(2026, 10, 20, 9),
		alertTime: "18:00",
		...input,
	});

describe("weatherNotifications", () => {
	it("warns at the alert time, for the 24 hours after it", () => {
		const next = frosty("2026-11-22T05:00");

		const notifications = run({ forecast: next });

		const risks = weatherRisks({
			hours: next.hours,
			plants: [basil],
			from: "2026-11-21T18:00",
			to: "2026-11-22T18:00",
		});
		expect(notifications).toEqual([
			{
				date: new Date(2026, 10, 21, 18),
				...weatherAlert(risks, "2026-11-21"),
			},
		]);
	});

	it("warns of nothing without a forecast", () => {
		expect(run({ forecast: null })).toEqual([]);
	});

	it("starts tomorrow once today's alert time has passed", () => {
		const notifications = run({
			forecast: frosty("2026-11-21T05:00"),
			now: new Date(2026, 10, 20, 19),
		});
		expect(notifications).toEqual([]);
	});

	it("never warns over hours the forecast does not cover", () => {
		const covered = frosty("2026-11-23T05:00");
		expect(run({ forecast: covered }).map(({ date }) => date)).toEqual([
			new Date(2026, 10, 22, 18),
		]);

		// Known until the 23rd at 11:00, short of the window ending at 18:00
		const short = { ...covered, hours: covered.hours.slice(0, -12) };
		expect(run({ forecast: short })).toEqual([]);
	});

	it("schedules three days ahead at most", () => {
		const notifications = run({
			forecast: frosty(
				"2026-11-20T23:00",
				"2026-11-21T23:00",
				"2026-11-22T23:00",
				"2026-11-23T05:00",
			),
			now: new Date(2026, 10, 20, 9),
		});
		expect(notifications).toHaveLength(3);
	});
});
