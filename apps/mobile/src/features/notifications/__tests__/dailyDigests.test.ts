import type { Care } from "@/features/care/careTypes";
import { dailyDigests } from "@/features/notifications/dailyDigests";
import type { ReminderTime } from "@/features/notifications/reminderTime";
import type { Plant } from "@/features/plants/plantSchema";

const plant = (id: string, overrides: Partial<Plant> = {}) =>
	({
		id,
		name: id,
		nickname: null,
		watering: 2,
		archivedAt: null,
		...overrides,
	}) as Plant;

// Weekly cares, so a care done on June 3 is due on June 10
const care = (
	plantId: string,
	type: Care["type"],
	lastDoneAt: string | null,
	overrides: Partial<Care> = {},
): Care => ({
	id: `${plantId}-${type}`,
	plantId,
	type,
	frequency: { amount: 1, unit: "week" },
	period: null,
	lastDoneAt,
	startedAt: "2026-01-01",
	snoozedUntil: null,
	reminder: true,
	...overrides,
});

const JUNE_10_AT_8 = new Date(2026, 5, 10, 8, 0);

const run = (
	plants: Plant[],
	cares: Care[],
	now = JUNE_10_AT_8,
	reminderTime: ReminderTime = "09:00",
) => dailyDigests({ plants, cares, climate: "north", now, reminderTime });

const day = (digest: { date: Date }) =>
	`${digest.date.getMonth() + 1}/${digest.date.getDate()}`;

describe("dailyDigests", () => {
	it("starts today when the reminder time is still ahead", () => {
		const digests = run(
			[plant("pilea")],
			[care("pilea", "fertilizing", "2026-06-03")],
		);
		expect(digests[0].date).toEqual(new Date(2026, 5, 10, 9, 0));
	});

	it("starts tomorrow once the reminder time has passed", () => {
		const digests = run(
			[plant("pilea")],
			[care("pilea", "fertilizing", "2026-06-03")],
			new Date(2026, 5, 10, 9, 30),
		);
		expect(day(digests[0])).toBe("6/11");
	});

	it("keeps a due care in every digest of the 30 days, then pauses", () => {
		const digests = run(
			[plant("pilea")],
			[care("pilea", "fertilizing", "2026-06-03")],
		);
		const reminders = digests.slice(0, -1);
		expect(reminders).toHaveLength(30);
		expect(day(reminders[29])).toBe("7/9");
		const pause = digests[30];
		expect(day(pause)).toBe("7/10");
		expect(pause.title).toBe("Vos rappels sont en pause");
	});

	it("starts listing an upcoming care on its due date", () => {
		const digests = run(
			[plant("pilea")],
			[care("pilea", "fertilizing", "2026-06-08")],
		);
		expect(day(digests[0])).toBe("6/15");
	});

	it("keeps the reminder time across a daylight saving change", () => {
		const digests = run(
			[plant("pilea")],
			[care("pilea", "fertilizing", "2026-10-13")],
			new Date(2026, 9, 20, 8, 0),
			"07:30",
		);
		for (const digest of digests) {
			expect([digest.date.getHours(), digest.date.getMinutes()]).toEqual([
				7, 30,
			]);
		}
	});

	it("leaves out muted cares, archived plants and cares without a due date", () => {
		const digests = run(
			[plant("pilea"), plant("ficus", { archivedAt: "2026-05-01" })],
			[
				care("pilea", "fertilizing", "2026-06-03", { reminder: false }),
				care("pilea", "pruning", "2026-06-03", { frequency: null }),
				care("ficus", "fertilizing", "2026-06-03"),
			],
		);
		expect(digests).toEqual([]);
	});

	it("groups the cares by plant, the plant name first, oldest due first", () => {
		const [digest] = run(
			[plant("monstera"), plant("pilea", { nickname: "Pili" })],
			[
				care("pilea", "fertilizing", "2026-06-01"),
				care("monstera", "misting", "2026-06-03"),
				care("monstera", "fertilizing", "2026-06-02"),
			],
		);
		expect(digest.title).toBe("3 soins à faire");
		expect(digest.body).toBe(
			"“Pili” · Alimenter, monstera · Alimenter, Brumiser",
		);
	});

	it("names the first three plants and counts the others", () => {
		const names = ["a", "b", "c", "d", "e"];
		const [digest] = run(
			names.map((name) => plant(name)),
			names.map((name) => care(name, "fertilizing", "2026-06-03")),
		);
		expect(digest.title).toBe("5 soins à faire");
		expect(digest.body).toBe(
			"a · Alimenter, b · Alimenter, c · Alimenter et 2 autres plantes",
		);
	});

	it("uses the singular for a single care", () => {
		const [digest] = run(
			[plant("pilea")],
			[care("pilea", "fertilizing", "2026-06-03")],
		);
		expect(digest.title).toBe("1 soin à faire");
	});
});
