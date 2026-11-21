// Local time of the place, like "2026-11-20T05:00"
export type ForecastHour = {
	time: string;
	temperature: number;
	gusts: number;
	code: number;
};

export type Forecast = { fetchedAt: string; hours: ForecastHour[] };

export type Place = { name: string; latitude: number; longitude: number };
