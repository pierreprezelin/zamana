const mockQueries: string[] = [];
let mockUuid = 0;

jest.mock("expo-crypto", () => ({ randomUUID: () => `id-${++mockUuid}` }));

jest.mock("@/utils/database", () => ({
	database: {
		getAllSync: () => [],
		runAsync: async (sql: string) => {
			mockQueries.push(sql.trim().split(/\s+/).slice(0, 3).join(" "));
		},
		withExclusiveTransactionAsync: async (
			task: (transaction: unknown) => Promise<void>,
		) => {
			const { database } = jest.requireMock("@/utils/database");
			await task(database);
		},
	},
}));

const { useCareStore } =
	require("@/features/care/useCareStore") as typeof import("@/features/care/useCareStore");

const state = () => useCareStore.getState();
const careOf = (id: string) => state().cares.find((care) => care.id === id);

const fertilizing = {
	type: "fertilizing" as const,
	frequency: { amount: 4, unit: "week" as const },
	period: null,
	lastDoneAt: "2026-06-01",
	reminder: true,
};

describe("useCareStore", () => {
	beforeEach(() => {
		jest.useFakeTimers().setSystemTime(new Date(2026, 5, 10, 9, 42));
		useCareStore.setState({ cares: [], logs: [] });
		mockQueries.length = 0;
	});

	afterEach(() => jest.useRealTimers());

	it("tracks watering from today", async () => {
		const id = await state().trackWatering("plant-1");
		expect(careOf(id)).toEqual({
			id,
			plantId: "plant-1",
			type: "watering",
			frequency: null,
			period: null,
			lastDoneAt: null,
			startedAt: "2026-06-10",
			snoozedUntil: null,
			reminder: true,
		});
	});

	it("configures and edits a care", async () => {
		const id = await state().createCare("plant-1", fertilizing);
		expect(careOf(id)).toMatchObject({
			...fertilizing,
			startedAt: "2026-06-10",
		});

		await state().updateCare(id, { ...fertilizing, reminder: false });
		expect(careOf(id)?.reminder).toBe(false);
	});

	it("switches reminders on and off", async () => {
		const id = await state().createCare("plant-1", fertilizing);
		await state().setReminder(id, false);
		expect(careOf(id)?.reminder).toBe(false);
	});

	it("logs a done care and clears its snooze", async () => {
		const id = await state().createCare("plant-1", fertilizing);
		await state().skipCare(id, "2026-06-12");
		await state().markDone(id);

		expect(careOf(id)).toMatchObject({
			lastDoneAt: "2026-06-10",
			snoozedUntil: null,
		});
		expect(state().logs.at(-1)).toMatchObject({
			plantId: "plant-1",
			type: "fertilizing",
			outcome: "done",
			date: "2026-06-10",
			previousLastDoneAt: "2026-06-01",
			previousSnoozedUntil: "2026-06-12",
		});
	});

	it("snoozes a care without changing its last time", async () => {
		const id = await state().createCare("plant-1", fertilizing);
		await state().skipCare(id, "2026-06-12");

		expect(careOf(id)).toMatchObject({
			lastDoneAt: "2026-06-01",
			snoozedUntil: "2026-06-12",
		});
		expect(state().logs.at(-1)?.outcome).toBe("skipped");
	});

	it("undoes an action back to the previous state", async () => {
		const id = await state().createCare("plant-1", fertilizing);
		await state().markDone(id);
		const log = state().logs.at(-1);
		if (!log) throw new Error("No log");

		await state().undo(log.id);

		expect(careOf(id)).toMatchObject({
			lastDoneAt: "2026-06-01",
			snoozedUntil: null,
		});
		expect(state().logs).toEqual([]);
	});

	it("stops a care", async () => {
		const id = await state().createCare("plant-1", fertilizing);
		await state().stopCare(id);

		expect(careOf(id)).toBeUndefined();
	});

	it("forgets everything about a deleted plant", async () => {
		const id = await state().createCare("plant-1", fertilizing);
		await state().markDone(id);
		await state().createCare("plant-2", fertilizing);

		state().forgetPlant("plant-1");

		expect(state().cares.map((care) => care.plantId)).toEqual(["plant-2"]);
		expect(state().logs).toEqual([]);
	});

	it("ignores a second tap while the first one is saving", async () => {
		const id = await state().createCare("plant-1", fertilizing);
		await Promise.all([state().markDone(id), state().markDone(id)]);

		expect(state().logs).toHaveLength(1);
	});

	it("drops today's log of a stopped care, so undo cannot touch its successor", async () => {
		const id = await state().createCare("plant-1", fertilizing);
		await state().markDone(id);
		await state().stopCare(id);

		expect(state().logs).toEqual([]);
	});
});
