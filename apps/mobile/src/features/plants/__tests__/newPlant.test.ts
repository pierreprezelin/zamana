import { newPlantToFeature } from "@/features/plants/newPlant";
import type { Plant } from "@/features/plants/plantSchema";

const now = new Date("2026-11-22T12:00:00.000Z");
const hoursAgo = (hours: number) =>
	new Date(now.getTime() - hours * 3_600_000).toISOString();

const plant = (id: string, createdAt: string, overrides: Partial<Plant> = {}) =>
	({ id, createdAt, archivedAt: null, ...overrides }) as Plant;

describe("newPlantToFeature", () => {
	it("features a plant added less than 24 hours ago", () => {
		const fresh = plant("fresh", hoursAgo(23));
		expect(
			newPlantToFeature({ plants: [fresh], dismissedUpTo: null, now }),
		).toBe(fresh);
	});

	it("features nothing from 24 hours on", () => {
		expect(
			newPlantToFeature({
				plants: [plant("day", hoursAgo(24))],
				dismissedUpTo: null,
				now,
			}),
		).toBeNull();
	});

	it("features the latest added plant", () => {
		const latest = plant("latest", hoursAgo(1));
		expect(
			newPlantToFeature({
				plants: [plant("older", hoursAgo(5)), latest],
				dismissedUpTo: null,
				now,
			}),
		).toBe(latest);
	});

	it("ignores the archived plants", () => {
		const current = plant("current", hoursAgo(5));
		expect(
			newPlantToFeature({
				plants: [
					plant("archived", hoursAgo(1), { archivedAt: hoursAgo(0) }),
					current,
				],
				dismissedUpTo: null,
				now,
			}),
		).toBe(current);
	});

	it("features nothing once dismissed", () => {
		expect(
			newPlantToFeature({
				plants: [plant("fresh", hoursAgo(5))],
				dismissedUpTo: hoursAgo(2),
				now,
			}),
		).toBeNull();
	});

	it("features nothing once the plant itself is dismissed", () => {
		const fresh = plant("fresh", hoursAgo(5));
		expect(
			newPlantToFeature({
				plants: [fresh],
				dismissedUpTo: fresh.createdAt,
				now,
			}),
		).toBeNull();
	});

	it("features a plant added after the dismissal", () => {
		const latest = plant("latest", hoursAgo(1));
		expect(
			newPlantToFeature({
				plants: [plant("older", hoursAgo(5)), latest],
				dismissedUpTo: hoursAgo(2),
				now,
			}),
		).toBe(latest);
	});

	it("features nothing without plants", () => {
		expect(
			newPlantToFeature({ plants: [], dismissedUpTo: null, now }),
		).toBeNull();
	});
});
