import i18next from "i18next";
import type { Plant } from "@/features/plants/plantSchema";
import {
	outdoorHelper,
	placeShortName,
	riskAdvice,
	riskLine,
	riskLines,
	riskParts,
	weatherAlert,
} from "@/features/weather/weatherLabels";
import type { WeatherRisk } from "@/features/weather/weatherRisks";

const plant = (name: string, nickname: string | null = null) =>
	({ name, nickname }) as Plant;

const risk = (overrides: Partial<WeatherRisk>): WeatherRisk => ({
	kind: "cold",
	value: -2.4,
	at: "2026-11-21T05:00",
	plants: [plant("Basilic")],
	shelter: false,
	...overrides,
});

const today = "2026-11-20";

afterEach(() => i18next.changeLanguage("fr"));

describe("riskLine", () => {
	it.each([
		[risk({ kind: "cold" }), "Froid : -2 °C demain vers 5 h"],
		[
			risk({ kind: "heat", value: 37.6, at: "2026-11-20T15:00" }),
			"Chaleur : 38 °C aujourd'hui vers 15 h",
		],
		[risk({ kind: "storm", value: 95 }), "Orage demain vers 5 h"],
		[
			risk({ kind: "wind", value: 72.3 }),
			"Vent : rafales à 72 km/h demain vers 5 h",
		],
	])("describes the risk", (input, line) => {
		expect(riskLine(input, today)).toBe(line);
	});

	it("tells the hour on 12 hours in English", async () => {
		await i18next.changeLanguage("en");

		expect(
			riskLine(risk({ kind: "heat", at: "2026-11-20T15:00" }), today),
		).toMatch(/^Heat: -2 °C today around 3\sPM$/);
	});
});

describe("riskAdvice", () => {
	it.each([
		[
			risk({ shelter: false }),
			"À rentrer à l'abri, ou à couvrir d'un voile d'hivernage.",
		],
		[
			risk({ shelter: true }),
			"À rentrer à l'abri du gel (maison, garage, véranda).",
		],
		[
			risk({ shelter: true, value: 9 }),
			"À rentrer à l'abri du froid (maison, véranda).",
		],
		[risk({ kind: "heat" }), "À mettre à l'ombre et à arroser."],
		[risk({ kind: "storm" }), "À abriter ou à attacher."],
		[risk({ kind: "wind" }), "À abriter ou à attacher."],
	])("says what to do", (input, advice) => {
		expect(riskAdvice(input)).toBe(advice);
	});
});

describe("weatherAlert", () => {
	it("leads with the first risk and lists each one with its plants and advice", () => {
		const alert = weatherAlert(
			[
				risk({
					plants: [plant("Basilic"), plant("Citrus", "Citronnier")],
					shelter: true,
				}),
				risk({ kind: "wind", value: 65, plants: [plant("Basilic")] }),
			],
			today,
		);

		expect(alert.title).toBe("Froid : -2 °C demain vers 5 h");
		expect(alert.body).toBe(
			[
				"Froid : -2 °C demain vers 5 h · Basilic et “Citronnier”. À rentrer à l'abri du gel (maison, garage, véranda).",
				"Vent : rafales à 65 km/h demain vers 5 h · Basilic. À abriter ou à attacher.",
				"Rentrée pour la saison ? Décochez « Plante d'extérieur » dans sa fiche.",
			].join("\n"),
		);
	});

	it("lists three plants or more with commas", () => {
		const { body } = weatherAlert(
			[risk({ plants: [plant("A"), plant("B"), plant("C")] })],
			today,
		);
		expect(body).toContain("· A, B et C.");
	});
});

describe("outdoorHelper", () => {
	it.each([
		[1, 0],
		[2, 5],
		[3, 12],
	])("tells the cold threshold of a need %i", (need, cold) => {
		expect(outdoorHelper(need)).toBe(
			`Une alerte en cas de froid (sous ${cold} °C), de chaleur (plus de 35 °C), d'orage ou de vent fort.`,
		);
	});
});

describe("placeShortName", () => {
	it("keeps the town only", () => {
		expect(placeShortName("Lyon, Auvergne-Rhône-Alpes, France")).toBe("Lyon");
		expect(placeShortName("45.8, 4.8")).toBe("45.8, 4.8");
	});
});

describe("riskLines", () => {
	it("gives one line per risk, without the season hint the banner links to", () => {
		expect(
			riskLines([risk({ plants: [plant("Basilic")], shelter: true })], today),
		).toEqual([
			"Froid : -2 °C demain vers 5 h · Basilic. À rentrer à l'abri du gel (maison, garage, véranda).",
		]);
	});
});

describe("riskParts", () => {
	it("splits a risk between what happens to which plants, and what to do", () => {
		expect(
			riskParts(risk({ plants: [plant("Basilic")], shelter: true }), today),
		).toEqual({
			summary: "Froid : -2 °C demain vers 5 h · Basilic.",
			advice: "À rentrer à l'abri du gel (maison, garage, véranda).",
		});
	});
});
