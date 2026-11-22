import { usePlantStore } from "@/features/plants/usePlantStore";
import { useWeatherStore } from "@/features/weather/useWeatherStore";
import { weatherWindow } from "@/features/weather/weatherNotifications";
import { weatherRisks } from "@/features/weather/weatherRisks";

// The risks of the next 24 hours, or null when none is forecast
export function useWeatherAlert() {
	const plants = usePlantStore((state) => state.plants);
	const alertsEnabled = useWeatherStore((state) => state.alertsEnabled);
	const forecast = useWeatherStore((state) => state.forecast);
	const place = useWeatherStore((state) => state.place);

	if (!alertsEnabled || !forecast || !place) return null;
	const risks = weatherRisks({
		hours: forecast.hours,
		plants,
		...weatherWindow(new Date()),
	});
	return risks.length ? { place, risks } : null;
}

export type WeatherAlert = NonNullable<ReturnType<typeof useWeatherAlert>>;
