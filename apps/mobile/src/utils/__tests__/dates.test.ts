import i18next from "i18next";
import {
	compareISO,
	formatDate,
	formatDateTime,
	formatHour,
	formatTime,
	parseISODate,
	toISODate,
} from "@/utils/dates";

afterEach(() => i18next.changeLanguage("fr"));

const inEnglish = () => i18next.changeLanguage("en");

describe("dates", () => {
	it("formats a local date", () => {
		expect(toISODate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
	});

	it("parses a date as local midnight", () => {
		expect(parseISODate("2026-01-05")).toEqual(new Date(2026, 0, 5));
	});

	it("formats a date in French", () => {
		expect(formatDate("2026-10-18")).toBe("18 octobre 2026");
	});

	it("formats a local date and time in French", () => {
		expect(formatDateTime(new Date(2026, 8, 23, 7, 6).toISOString())).toBe(
			"23 septembre 2026 · 7 h 06",
		);
	});

	it("formats a local date and time in English", async () => {
		await inEnglish();

		expect(formatDateTime(new Date(2026, 8, 23, 19, 6).toISOString())).toMatch(
			/^September 23, 2026 · 7:06\sPM$/,
		);
	});
});

describe("formatTime", () => {
	it("writes French hours with an h", () => {
		expect(formatTime(9, 5)).toBe("9 h 05");
		expect(formatTime(21, 0)).toBe("21 h 00");
	});

	it("writes English hours on 12 hours", async () => {
		await inEnglish();

		expect(formatTime(9, 5)).toMatch(/^9:05\sAM$/);
		expect(formatTime(21, 0)).toMatch(/^9:00\sPM$/);
	});
});

describe("formatHour", () => {
	it("writes a French round hour without minutes", () => {
		expect(formatHour(5)).toBe("5 h");
	});

	it("writes an English round hour without minutes", async () => {
		await inEnglish();

		expect(formatHour(5)).toMatch(/^5\sAM$/);
		expect(formatHour(15)).toMatch(/^3\sPM$/);
	});
});

describe("compareISO", () => {
	it("orders ISO dates and timestamps by time", () => {
		expect(
			["2026-03-01", "2025-12-31", "2026-03-01", "2026-01-15"].sort(compareISO),
		).toEqual(["2025-12-31", "2026-01-15", "2026-03-01", "2026-03-01"]);
		expect(
			compareISO("2026-06-10T08:00:00.000Z", "2026-06-10T07:59:59.999Z"),
		).toBeGreaterThan(0);
		expect(compareISO("2026-06-10", "2026-06-10")).toBe(0);
	});
});
