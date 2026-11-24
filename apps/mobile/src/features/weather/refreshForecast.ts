import { usePlantStore } from "@/features/plants/usePlantStore";
import { refreshDevicePlace } from "@/features/weather/devicePlace";
import { fetchForecast } from "@/features/weather/openMeteo";
import { samePlace, useWeatherStore } from "@/features/weather/useWeatherStore";
import { alertedPlants } from "@/features/weather/weatherRisks";
import type { Place } from "@/features/weather/weatherTypes";

// Opening the app several times an hour should not call the service each time
const FORECAST_MAX_AGE_MS = 60 * 60 * 1000;
// Offline, each swipe on Today would otherwise call the service again
const RETRY_DELAY_MS = 5 * 60 * 1000;

const ageOf = (iso: string | null | undefined) =>
	iso ? Date.now() - Date.parse(iso) : Infinity;

// Without an outdoor plant, nothing about the user leaves the phone
export const weatherAlertsNeeded = () =>
	useWeatherStore.getState().alertsEnabled &&
	alertedPlants(usePlantStore.getState().plants).length > 0;

// The user may have picked another place meanwhile, or come back to it with a newer fetch
const fetchFor = async (place: Place, isLatest: () => boolean) => {
	const { setForecast, setFailed } = useWeatherStore.getState();
	const stillWanted = () =>
		isLatest() && samePlace(useWeatherStore.getState().place, place);
	try {
		const forecast = await fetchForecast(place.latitude, place.longitude);
		if (stillWanted()) setForecast(forecast);
	} catch {
		if (stillWanted()) setFailed(new Date().toISOString());
	}
};

let pending: { place: Place; promise: Promise<void> } | undefined;

export const refreshForecast = ({ force = false } = {}) => {
	const { place, forecast, failedAt } = useWeatherStore.getState();
	if (!place || !weatherAlertsNeeded()) return Promise.resolve();
	if (pending && samePlace(pending.place, place)) return pending.promise;
	if (!force && ageOf(forecast?.fetchedAt) < FORECAST_MAX_AGE_MS) {
		return Promise.resolve();
	}
	if (!force && ageOf(failedAt) < RETRY_DELAY_MS) return Promise.resolve();

	const isLatest = () => pending?.promise === promise;
	const promise: Promise<void> = fetchFor(place, isLatest).finally(() => {
		if (isLatest()) pending = undefined;
	});
	pending = { place, promise };
	return promise;
};

// The device place first, so the forecast follows the user when they move
export const refreshWeather = async (options?: { force?: boolean }) => {
	if (!weatherAlertsNeeded()) return;
	await refreshDevicePlace().catch((error) =>
		console.warn("Device place not read", error),
	);
	await refreshForecast(options);
};
