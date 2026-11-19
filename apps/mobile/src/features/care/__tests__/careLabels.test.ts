import {
	careSubtitle,
	doneAtLabel,
	dueLabel,
	frequencyLabel,
	handledLabel,
	lastDoneLabel,
	plantTasksSummary,
} from "@/features/care/careLabels";
import type { Care, CareLog } from "@/features/care/careTypes";

const care = (overrides: Partial<Care> = {}): Care => ({
	id: "care-1",
	plantId: "plant-1",
	type: "fertilizing",
	frequency: { amount: 4, unit: "week" },
	period: null,
	lastDoneAt: "2026-05-25",
	startedAt: "2026-01-01",
	snoozedUntil: null,
	reminder: true,
	...overrides,
});

describe("frequencyLabel", () => {
	it.each([
		[{ amount: 1, unit: "day" as const }, "Tous les jours"],
		[{ amount: 3, unit: "day" as const }, "Tous les 3 jours"],
		[{ amount: 1, unit: "week" as const }, "Toutes les semaines"],
		[{ amount: 4, unit: "week" as const }, "Toutes les 4 semaines"],
		[{ amount: 1, unit: "month" as const }, "Tous les mois"],
		[{ amount: 2, unit: "year" as const }, "Tous les 2 ans"],
	])("describes %o", (frequency, label) => {
		expect(frequencyLabel(care({ frequency }), 2)).toBe(label);
	});

	it("adds the period", () => {
		const fertilizing = care({ period: { startMonth: 3, endMonth: 10 } });
		expect(frequencyLabel(fertilizing, 2)).toBe(
			"Toutes les 4 semaines, de mars à octobre",
		);
	});

	it("uses the watering level for watering", () => {
		expect(frequencyLabel(care({ type: "watering", frequency: null }), 2)).toBe(
			"Toutes les 1-2 semaines",
		);
	});

	it("says when there is none", () => {
		expect(frequencyLabel(care({ frequency: null }), 2)).toBe(
			"Aucune fréquence définie",
		);
	});
});

describe("dueLabel", () => {
	const today = "2026-06-10";

	it.each([
		["2026-06-09", "En retard de 1 jour"],
		["2026-06-08", "En retard de 2 jours"],
		["2026-06-10", "Aujourd'hui"],
		["2026-06-11", "Demain"],
		["2026-06-14", "Dans 4 jours"],
		["2027-03-01", "En mars 2027"],
	])("for %s", (dueDate, label) => {
		expect(dueLabel(dueDate, today)).toBe(label);
	});
});

describe("lastDoneLabel", () => {
	const now = new Date(2026, 5, 10, 12);

	it.each([
		[null, "Jamais fait"],
		["2026-06-10", "Fait aujourd'hui"],
		["2026-06-01", "Il y a 9 jours"],
		["2026-03-01", "Il y a 3 mois"],
	])("for %s", (lastDoneAt, label) => {
		expect(lastDoneLabel(lastDoneAt, now)).toBe(label);
	});
});

it("joins the last time and the frequency in the card subtitle", () => {
	expect(careSubtitle(care(), 2, new Date(2026, 5, 10))).toBe(
		"Il y a 16 jours · toutes les 4 semaines",
	);
});

it("tells the time a care was done", () => {
	expect(doneAtLabel(new Date(2026, 5, 10, 9, 5).toISOString())).toBe(
		"Fait à 9 h 05",
	);
});

it.each([
	[2, 0, 0, "2 soins à faire"],
	[1, 1, 0, "1 soin à faire · 1 fait"],
	[0, 2, 0, "2 faits"],
	[1, 0, 1, "1 soin à faire · 1 reporté"],
	[0, 1, 2, "1 fait · 2 reportés"],
])(
	"sums up %i pending, %i done and %i skipped cares",
	(pending, done, skipped, label) => {
		expect(plantTasksSummary(pending, done, skipped)).toBe(label);
	},
);

describe("handledLabel", () => {
	const log = (outcome: CareLog["outcome"]): CareLog => ({
		id: "log-1",
		plantId: "plant-1",
		type: "watering",
		outcome,
		date: "2026-06-10",
		createdAt: new Date(2026, 5, 10, 9, 5).toISOString(),
		previousLastDoneAt: null,
		previousSnoozedUntil: null,
	});

	it("tells the time a care was done", () => {
		expect(handledLabel(log("done"), "2026-06-17", "2026-06-10")).toBe(
			"Fait à 9 h 05",
		);
	});

	it("tells when a skipped care is due next", () => {
		expect(handledLabel(log("skipped"), "2026-06-11", "2026-06-10")).toBe(
			"Reporté, prochain soin demain",
		);
	});

	it("still tells a care was skipped once it has no due date", () => {
		expect(handledLabel(log("skipped"), null, "2026-06-10")).toBe("Reporté");
	});
});
