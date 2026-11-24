import { displayName } from "@/features/plants/plantLabels";
import type { Plant } from "@/features/plants/plantSchema";
import {
	COLD_THRESHOLDS,
	HEAT_THRESHOLD,
	type WeatherRisk,
} from "@/features/weather/weatherRisks";
import { formatHour } from "@/utils/dates";
import { t } from "@/utils/i18n";

// "2026-11-21T05:00": the date of the place, then its hour
const dateOf = (time: string) => time.slice(0, 10);
const hourOf = (time: string) => Number(time.slice(11, 13));

export const riskLine = (risk: WeatherRisk, today: string) =>
	t(`weather.risk.${risk.kind}`, {
		value: Math.round(risk.value),
		day: t(
			dateOf(risk.at) === today ? "weather.day.today" : "weather.day.tomorrow",
		),
		hour: formatHour(hourOf(risk.at)),
	});

export const riskAdvice = (risk: WeatherRisk) => {
	if (risk.kind === "cold") {
		if (!risk.shelter) return t("weather.advice.fleece");
		// A warm plant needs a shelter well above freezing
		return t(risk.value < 0 ? "weather.advice.frost" : "weather.advice.cold");
	}
	return t(`weather.advice.${risk.kind}`);
};

// Hermes lacks Intl.ListFormat: "A, B et C"
const plantList = (plants: Plant[]) => {
	const names = plants.map(displayName);
	const last = names.pop();
	return names.length
		? `${names.join(", ")}${t("weather.and")}${last}`
		: (last ?? "");
};

export const riskParts = (risk: WeatherRisk, today: string) => ({
	summary: t("weather.riskSummary", {
		line: riskLine(risk, today),
		plants: plantList(risk.plants),
	}),
	advice: riskAdvice(risk),
});

// One line per risk, for a notification
const riskLines = (risks: WeatherRisk[], today: string) =>
	risks.map((risk) => {
		const { summary, advice } = riskParts(risk, today);
		return `${summary} ${advice}`;
	});

// A notification cannot link to the plant: it says how to stop the alerts
export const weatherAlert = (risks: WeatherRisk[], today: string) => ({
	title: riskLine(risks[0], today),
	body: [...riskLines(risks, today), t("weather.seasonHint")].join("\n"),
});

export const outdoorHelper = (temperature: number) =>
	t("weather.outdoorHelper", {
		cold: COLD_THRESHOLDS[temperature],
		heat: HEAT_THRESHOLD,
	});

// "Lyon, Auvergne-Rhône-Alpes, France" reads "Lyon"; a position without a town stays whole
export const placeShortName = (name: string) => {
	const [town] = name.split(", ");
	return Number.isNaN(Number(town)) ? town : name;
};
