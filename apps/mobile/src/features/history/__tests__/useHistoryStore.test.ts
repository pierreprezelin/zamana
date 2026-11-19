const mockQueries: string[] = [];
const mockDeletePhoto = jest.fn();
let mockUuid = 0;

jest.mock("expo-crypto", () => ({ randomUUID: () => `entry-${++mockUuid}` }));

jest.mock("@/features/plants/plantPhoto", () => ({
	deletePhoto: (filename: string) => mockDeletePhoto(filename),
}));

jest.mock("@/utils/database", () => ({
	database: {
		getAllSync: () => [],
		runAsync: async (sql: string) => {
			mockQueries.push(sql.trim().split(/\s+/).slice(0, 3).join(" "));
		},
	},
}));

const { useHistoryStore } =
	require("@/features/history/useHistoryStore") as typeof import("@/features/history/useHistoryStore");

const state = () => useHistoryStore.getState();
const entryOf = (id: string) =>
	state().entries.find((entry) => entry.id === id);

describe("useHistoryStore", () => {
	beforeEach(() => {
		jest.useFakeTimers().setSystemTime(new Date("2026-09-23T15:16:00.000Z"));
		useHistoryStore.setState({ entries: [] });
		mockQueries.length = 0;
		mockDeletePhoto.mockClear();
	});

	afterEach(() => jest.useRealTimers());

	it("creates an entry", async () => {
		const id = await state().createEntry("plant-1", {
			photo: "a.jpg",
			note: "New leaf",
		});

		expect(mockQueries).toEqual(["INSERT INTO history_entry"]);
		expect(entryOf(id)).toEqual({
			id,
			plantId: "plant-1",
			photo: "a.jpg",
			note: "New leaf",
			createdAt: "2026-09-23T15:16:00.000Z",
			updatedAt: "2026-09-23T15:16:00.000Z",
		});
	});

	it("updates an entry and deletes its replaced photo", async () => {
		const id = await state().createEntry("plant-1", {
			photo: "a.jpg",
			note: null,
		});

		await state().updateEntry(id, { photo: "b.jpg", note: "Repotted" });

		expect(entryOf(id)).toMatchObject({ photo: "b.jpg", note: "Repotted" });
		expect(mockDeletePhoto).toHaveBeenCalledWith("a.jpg");
	});

	it("keeps the photo when it did not change", async () => {
		const id = await state().createEntry("plant-1", {
			photo: "a.jpg",
			note: null,
		});

		await state().updateEntry(id, { photo: "a.jpg", note: "Repotted" });

		expect(mockDeletePhoto).not.toHaveBeenCalled();
	});

	it("deletes an entry and its photo", async () => {
		const id = await state().createEntry("plant-1", {
			photo: "a.jpg",
			note: null,
		});

		await state().deleteEntry(id);

		expect(entryOf(id)).toBeUndefined();
		expect(mockDeletePhoto).toHaveBeenCalledWith("a.jpg");
	});

	it("forgets the entries of a deleted plant and deletes their photos", async () => {
		await state().createEntry("plant-1", { photo: "a.jpg", note: null });
		await state().createEntry("plant-2", { photo: null, note: "Kept" });

		state().forgetPlant("plant-1");

		expect(state().entries.map((entry) => entry.plantId)).toEqual(["plant-2"]);
		expect(mockDeletePhoto).toHaveBeenCalledWith("a.jpg");
	});
});
