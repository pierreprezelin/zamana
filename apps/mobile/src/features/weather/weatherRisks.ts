import type { Plant } from "@/features/plants/plantSchema";
import type { ForecastHour, Place } from "@/features/weather/weatherTypes";

// Below the range of each temperature need, so a warm plant left out does not ring every evening
export const COLD_THRESHOLDS: Record<number, number> = { 1: 0, 2: 5, 3: 12 };
export const HEAT_THRESHOLD = 35;
const GUSTS_THRESHOLD = 60;
const STORM_CODES = new Set([95, 96, 97, 99]);
// A fleece only gains a few degrees: below this, or for a warm plant, only a shelter will do
const FLEECE_LIMIT = -3;
const WARM_NEED = 3;

export type WeatherRiskKind = "cold" | "heat" | "storm" | "wind";

export type WeatherRisk = {
	kind: WeatherRiskKind;
	// °C for cold and heat, km/h for wind, the WMO code for a storm
	value: number;
	// The hour of the extreme value, or of the first storm
	at: string;
	plants: Plant[];
	shelter: boolean;
};

type RiskInput = {
	hours: ForecastHour[];
	plants: Plant[];
	// Local "YYYY-MM-DDTHH:mm", from included, to excluded
	from: string;
	to: string;
};

export const alertedPlants = (plants: Plant[]) =>
	plants.filter((plant) => plant.outdoor && !plant.archivedAt);

// Without a place, the outdoor plants would silently get no alert
export const needsWeatherPlace = ({
	alertsEnabled,
	place,
	plants,
}: {
	alertsEnabled: boolean;
	place: Place | null;
	plants: Plant[];
}) => alertsEnabled && !place && alertedPlants(plants).length > 0;

const extreme = (
	hours: ForecastHour[],
	value: (hour: ForecastHour) => number,
	isMore: (a: number, b: number) => boolean,
) =>
	hours.reduce((best, hour) =>
		isMore(value(hour), value(best)) ? hour : best,
	);

export const weatherRisks = ({
	hours,
	plants,
	from,
	to,
}: RiskInput): WeatherRisk[] => {
	const window = hours.filter(({ time }) => time >= from && time < to);
	const alerted = alertedPlants(plants);
	if (!window.length || !alerted.length) return [];

	const risks: WeatherRisk[] = [];
	const coldest = extreme(
		window,
		(hour) => hour.temperature,
		(a, b) => a < b,
	);
	const cold = alerted.filter(
		(plant) =>
			coldest.temperature < (COLD_THRESHOLDS[plant.temperature] ?? -Infinity),
	);
	if (cold.length) {
		risks.push({
			kind: "cold",
			value: coldest.temperature,
			at: coldest.time,
			plants: cold,
			shelter:
				coldest.temperature < FLEECE_LIMIT ||
				cold.some((plant) => plant.temperature === WARM_NEED),
		});
	}
	const hottest = extreme(
		window,
		(hour) => hour.temperature,
		(a, b) => a > b,
	);
	if (hottest.temperature > HEAT_THRESHOLD) {
		risks.push({
			kind: "heat",
			value: hottest.temperature,
			at: hottest.time,
			plants: alerted,
			shelter: false,
		});
	}
	const storm = window.find(({ code }) => STORM_CODES.has(code));
	if (storm) {
		risks.push({
			kind: "storm",
			value: storm.code,
			at: storm.time,
			plants: alerted,
			shelter: false,
		});
	}
	const windiest = extreme(
		window,
		(hour) => hour.gusts,
		(a, b) => a > b,
	);
	if (windiest.gusts >= GUSTS_THRESHOLD) {
		risks.push({
			kind: "wind",
			value: windiest.gusts,
			at: windiest.time,
			plants: alerted,
			shelter: false,
		});
	}
	return risks;
};
