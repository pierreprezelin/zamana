import { z } from "zod";
import type {
	Forecast,
	ForecastHour,
	Place,
} from "@/features/weather/weatherTypes";
import { getJson } from "@/utils/getJson";
import { locale } from "@/utils/i18n";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
// Today, the night after and a margin for the alerts scheduled ahead
const FORECAST_DAYS = 4;
const CITY_RESULTS = 5;

const values = z.array(z.number().nullable());
const forecastSchema = z.object({
	hourly: z
		.object({
			time: z.array(z.string()),
			temperature_2m: values,
			wind_gusts_10m: values,
			weather_code: values,
		})
		.optional(),
});
const citySchema = z.object({
	name: z.string(),
	admin1: z.string().optional(),
	country: z.string().optional(),
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
});

// About 10 km: enough for the weather, without sending where the user lives
export const roundCoordinate = (value: number) => Math.round(value * 10) / 10;

// The hours come back in the phone's time, even for a far-away city
const deviceTimeZone = () =>
	Intl.DateTimeFormat().resolvedOptions().timeZone ?? "auto";

export const fetchForecast = async (
	latitude: number,
	longitude: number,
): Promise<Forecast> => {
	const { hourly } = forecastSchema.parse(
		await getJson(FORECAST_URL, {
			latitude: String(roundCoordinate(latitude)),
			longitude: String(roundCoordinate(longitude)),
			hourly: "temperature_2m,wind_gusts_10m,weather_code",
			timezone: deviceTimeZone(),
			forecast_days: String(FORECAST_DAYS),
		}),
	);
	const hours = (hourly?.time ?? []).flatMap((time, index): ForecastHour[] => {
		const temperature = hourly?.temperature_2m[index];
		const gusts = hourly?.wind_gusts_10m[index];
		const code = hourly?.weather_code[index];
		// The last hours of a forecast come without values: unknown is not 0 °C
		if (temperature == null || gusts == null || code == null) return [];
		return [{ time, temperature, gusts, code }];
	});
	return { fetchedAt: new Date().toISOString(), hours };
};

export const searchCities = async (query: string): Promise<Place[]> => {
	const response = (await getJson(GEOCODING_URL, {
		name: query,
		count: String(CITY_RESULTS),
		language: locale(),
	})) as { results?: unknown };
	const results = Array.isArray(response?.results) ? response.results : [];
	return results.flatMap((result): Place[] => {
		const city = citySchema.safeParse(result);
		if (!city.success) return [];
		const { name, admin1, country, latitude, longitude } = city.data;
		return [
			{
				name: [name, admin1, country].filter(Boolean).join(", "),
				latitude,
				longitude,
			},
		];
	});
};
