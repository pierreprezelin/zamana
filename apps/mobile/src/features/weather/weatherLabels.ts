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

const riskValues = (risk: WeatherRisk, today: string) => ({
	value: Math.round(risk.value),
	day: t(
		dateOf(risk.at) === today ? "weather.day.today" : "weather.day.tomorrow",
	),
	hour: formatHour(hourOf(risk.at)),
});

export const riskLine = (risk: WeatherRisk, today: string) =>
	t(`weather.risk.${risk.kind}`, riskValues(risk, today));

// On the rounded value, as shown: -0.3 °C reads 0 °C
const isFrost = (risk: WeatherRisk) => Math.round(risk.value) < 0;

const alertKind = (risk: WeatherRisk) =>
	risk.kind === "cold" && isFrost(risk) ? "frost" : risk.kind;

const alertEmojis = {
	frost: "❄️",
	cold: "🥶",
	heat: "🔥",
	storm: "⛈️",
	wind: "💨",
};

export const riskAdvice = (risk: WeatherRisk) => {
	if (risk.kind === "cold") {
		if (!risk.shelter) return t("weather.advice.fleece");
		// A warm plant needs a shelter well above freezing
		return t(isFrost(risk) ? "weather.advice.frost" : "weather.advice.cold");
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

const riskSummary = (risk: WeatherRisk, line: string) =>
	t("weather.riskSummary", { line, plants: plantList(risk.plants) });

export const riskParts = (risk: WeatherRisk, today: string) => ({
	summary: riskSummary(risk, riskLine(risk, today)),
	advice: riskAdvice(risk),
});

// The title already tells the kind of a single risk: each line leads with its emoji
const alertLine = (risk: WeatherRisk, today: string) => {
	const detail = t(`weather.alertDetail.${risk.kind}`, riskValues(risk, today));
	const line = `${alertEmojis[alertKind(risk)]} ${detail}`;
	return `${riskSummary(risk, line)} ${riskAdvice(risk)}`;
};

const alertTitle = (risks: WeatherRisk[]) => {
	if (risks.length > 1) return `⚠️ ${t("weather.alertTitle.several")}`;
	const kind = alertKind(risks[0]);
	return `${alertEmojis[kind]} ${t(`weather.alertTitle.${kind}`)}`;
};

// A notification cannot link to the plant: it says how to stop the alerts
export const weatherAlert = (risks: WeatherRisk[], today: string) => ({
	title: alertTitle(risks),
	body: [
		...risks.map((risk) => alertLine(risk, today)),
		t("weather.seasonHint"),
	].join("\n"),
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
