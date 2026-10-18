import { formatDate, parseISODate, toISODate } from "@/utils/dates";

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
});
