import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
	isReminderTime,
	type ReminderTime,
} from "@/features/notifications/reminderTime";
import type { Forecast, Place } from "@/features/weather/weatherTypes";
import { mergePersisted } from "@/utils/mergePersisted";
import { syncStorage } from "@/utils/syncStorage";

// The evening before, to bring the pots in before the night
export const DEFAULT_ALERT_TIME: ReminderTime = "18:00";

export type PlaceSource = "device" | "city";

type Coordinates = Pick<Place, "latitude" | "longitude">;

export const samePlace = (a: Coordinates | null, b: Coordinates) =>
	a?.latitude === b.latitude && a?.longitude === b.longitude;

// A new place makes the forecast of the old one, and its failure, wrong
const placeSchema = z.object({
	name: z.string(),
	latitude: z.number(),
	longitude: z.number(),
});
const forecastSchema = z.object({
	fetchedAt: z.string(),
	hours: z.array(
		z.object({
			time: z.string(),
			temperature: z.number(),
			gusts: z.number(),
			code: z.number(),
		}),
	),
});

const noWeatherYet = { forecast: null, failedAt: null };

type WeatherPreferences = {
	alertsEnabled: boolean;
	alertTime: ReminderTime;
	source: PlaceSource;
	place: Place | null;
	forecast: Forecast | null;
	failedAt: string | null;
};

type WeatherState = WeatherPreferences & {
	setAlertsEnabled: (alertsEnabled: boolean) => void;
	setAlertTime: (alertTime: ReminderTime) => void;
	setCity: (place: Place) => void;
	chooseDevice: (place: Place) => void;
	setDevicePlace: (place: Place) => void;
	setForecast: (forecast: Forecast) => void;
	setFailed: (at: string) => void;
};

export const useWeatherStore = create<WeatherState>()(
	persist(
		(set) => ({
			alertsEnabled: true,
			alertTime: DEFAULT_ALERT_TIME,
			source: "device",
			place: null,
			forecast: null,
			failedAt: null,
			setAlertsEnabled: (alertsEnabled) => set({ alertsEnabled }),
			setAlertTime: (alertTime) => set({ alertTime }),
			setCity: (place) => set({ source: "city", place, ...noWeatherYet }),
			chooseDevice: (place) =>
				set({ source: "device", place, ...noWeatherYet }),
			setDevicePlace: (place) =>
				set((state) => {
					if (state.source !== "device") return {};
					return samePlace(state.place, place)
						? { place }
						: { place, ...noWeatherYet };
				}),
			setForecast: (forecast) => set({ forecast, failedAt: null }),
			setFailed: (failedAt) => set({ failedAt }),
		}),
		{
			name: "weather",
			storage: syncStorage,
			partialize: ({
				alertsEnabled,
				alertTime,
				source,
				place,
				forecast,
				failedAt,
			}) => ({ alertsEnabled, alertTime, source, place, forecast, failedAt }),
			// An unreadable time would silently stop every alert
			merge: mergePersisted<WeatherState>({
				alertsEnabled: z.boolean(),
				alertTime: z.custom<ReminderTime>(isReminderTime),
				source: z.enum(["device", "city"]),
				place: placeSchema.nullable(),
				forecast: forecastSchema.nullable(),
				failedAt: z.string().nullable(),
			}),
		},
	),
);
