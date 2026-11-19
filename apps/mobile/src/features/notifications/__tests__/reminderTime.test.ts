import {
	atReminderTime,
	isReminderTime,
	toReminderTime,
} from "@/features/notifications/reminderTime";

describe("reminderTime", () => {
	it("places the time on a later day, in local time", () => {
		expect(atReminderTime("07:30", new Date(2026, 0, 31, 22, 0), 1)).toEqual(
			new Date(2026, 1, 1, 7, 30),
		);
	});

	it("reads hours and minutes back from a date", () => {
		expect(toReminderTime(new Date(2026, 0, 1, 7, 5))).toBe("07:05");
	});

	it("only accepts a valid HH:MM time", () => {
		expect(isReminderTime("23:59")).toBe(true);
		expect(isReminderTime("24:00")).toBe(false);
		expect(isReminderTime("9h")).toBe(false);
		expect(isReminderTime(undefined)).toBe(false);
	});
});
