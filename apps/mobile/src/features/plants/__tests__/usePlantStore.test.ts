import { renderHook } from "@testing-library/react-native";
import type { Plant, PlantData } from "@/features/plants/plantSchema";

const mockRows = new Map<string, Record<string, unknown>>();
const mockDeletePhoto = jest.fn();
let mockUuid = 0;

jest.mock("expo-crypto", () => ({
	randomUUID: () => `plant-${++mockUuid}`,
}));

jest.mock("@/features/plants/plantPhoto", () => ({
	deletePhoto: (filename: string) => mockDeletePhoto(filename),
}));

jest.mock("@/utils/database", () => ({
	database: {
		getAllSync: () => [],
		runAsync: async (sql: string, ...params: unknown[]) => {
			if (sql.startsWith("INSERT")) {
				mockRows.set(params[0] as string, {
					photoCredit: params[2],
					name: params[4],
				});
			}
			if (sql.startsWith("DELETE")) mockRows.delete(params[0] as string);
		},
		withTransactionAsync: async (task: () => Promise<void>) => task(),
	},
}));

const { useCurrentPlants, usePastPlants, usePlant, usePlantStore } =
	require("@/features/plants/usePlantStore") as typeof import("@/features/plants/usePlantStore");
const { useCareStore } =
	require("@/features/care/useCareStore") as typeof import("@/features/care/useCareStore");

const { useHistoryStore } =
	require("@/features/history/useHistoryStore") as typeof import("@/features/history/useHistoryStore");

const caresOf = (plantId: string) =>
	useCareStore.getState().cares.filter((care) => care.plantId === plantId);

const data: PlantData = {
	photo: "photo.jpg",
	photoCredit: null,
	nickname: null,
	name: "Monstera",
	type: null,
	scientificName: null,
	origin: null,
	acquiredAt: null,
	location: null,
	bornAt: null,
	light: 2,
	watering: 2,
	temperature: 2,
	humidity: 2,
	outdoor: false,
	toxic: false,
	floweringSeasons: [],
	floweringType: null,
	lifespan: null,
	notes: null,
};

const plantOf = (id: string) =>
	usePlantStore.getState().plants.find((plant) => plant.id === id);

describe("usePlantStore", () => {
	beforeEach(() => mockDeletePhoto.mockClear());

	it("creates a plant in the database", async () => {
		const id = await usePlantStore.getState().createPlant(data);

		expect(mockRows.get(id)).toEqual({ photoCredit: null, name: "Monstera" });
		expect(plantOf(id)).toMatchObject({ name: "Monstera", archivedAt: null });
	});

	it("stores the credit of a photo from the encyclopedia", async () => {
		const photoCredit = {
			attribution: "(c) Jane",
			url: "https://www.inaturalist.org/photos/1",
		};

		const id = await usePlantStore
			.getState()
			.createPlant({ ...data, photoCredit });

		expect(mockRows.get(id)?.photoCredit).toBe(JSON.stringify(photoCredit));
		expect(plantOf(id)?.photoCredit).toEqual(photoCredit);
	});

	it("lists the newest plant first", async () => {
		const id = await usePlantStore
			.getState()
			.createPlant({ ...data, name: "Pothos" });

		expect(usePlantStore.getState().plants[0]?.id).toBe(id);
	});

	it("updates a plant and deletes its replaced photo", async () => {
		const id = await usePlantStore.getState().createPlant(data);
		await usePlantStore
			.getState()
			.updatePlant(id, { ...data, name: "Raven", photo: "new.jpg" });

		expect(plantOf(id)).toMatchObject({ name: "Raven", photo: "new.jpg" });
		expect(mockDeletePhoto).toHaveBeenCalledWith("photo.jpg");
	});

	it("keeps the photo when it did not change", async () => {
		const id = await usePlantStore.getState().createPlant(data);
		await usePlantStore.getState().updatePlant(id, data);

		expect(mockDeletePhoto).not.toHaveBeenCalled();
	});

	it("archives and restores a plant", async () => {
		const id = await usePlantStore.getState().createPlant(data);

		await usePlantStore.getState().archivePlant(id, "given");
		expect(plantOf(id)?.archiveReason).toBe("given");
		expect(plantOf(id)?.archivedAt).toEqual(expect.any(String));

		await usePlantStore.getState().restorePlant(id);
		expect(plantOf(id)).toMatchObject({
			archivedAt: null,
			archiveReason: null,
		});
	});

	it("deletes a plant and its photo", async () => {
		const id = await usePlantStore.getState().createPlant(data);
		await usePlantStore.getState().deletePlant(id);

		expect(plantOf(id)).toBeUndefined();
		expect(mockRows.has(id)).toBe(false);
		expect(mockDeletePhoto).toHaveBeenCalledWith("photo.jpg");
	});

	it("tracks the watering of a new plant", async () => {
		const id = await usePlantStore.getState().createPlant(data);

		expect(caresOf(id).map((care) => care.type)).toEqual(["watering"]);
	});

	it("deletes the photos of the history entries of a deleted plant", async () => {
		const id = await usePlantStore.getState().createPlant(data);
		await useHistoryStore
			.getState()
			.createEntry(id, { photo: "entry.jpg", note: null });

		await usePlantStore.getState().deletePlant(id);

		expect(mockDeletePhoto).toHaveBeenCalledWith("entry.jpg");
		expect(useHistoryStore.getState().entries).toEqual([]);
	});

	it("forgets the cares of a deleted plant", async () => {
		const id = await usePlantStore.getState().createPlant(data);
		await usePlantStore.getState().deletePlant(id);

		expect(caresOf(id)).toEqual([]);
	});
});

describe("plant selectors", () => {
	const plantWith = (id: string, archivedAt: string | null = null): Plant => ({
		...data,
		id,
		createdAt: "2026-06-01T08:00:00.000Z",
		updatedAt: "2026-06-01T08:00:00.000Z",
		archivedAt,
		archiveReason: archivedAt ? "dead" : null,
	});

	beforeEach(() =>
		usePlantStore.setState({
			plants: [
				plantWith("alive-1"),
				plantWith("gone", "2026-07-01T08:00:00.000Z"),
				plantWith("alive-2"),
			],
		}),
	);

	it("finds a plant by its id", async () => {
		const { result } = await renderHook(() => usePlant("gone"));

		expect(result.current?.id).toBe("gone");
	});

	it("finds no plant for an unknown id", async () => {
		const { result } = await renderHook(() => usePlant("missing"));

		expect(result.current).toBeUndefined();
	});

	it("lists the plants that are not archived", async () => {
		const { result } = await renderHook(() => useCurrentPlants());

		expect(result.current.map((plant) => plant.id)).toEqual([
			"alive-1",
			"alive-2",
		]);
	});

	it("lists the archived plants", async () => {
		const { result } = await renderHook(() => usePastPlants());

		expect(result.current.map((plant) => plant.id)).toEqual(["gone"]);
	});

	it("keeps the same lists while the plants do not change", async () => {
		const { result, rerender } = await renderHook(() => useCurrentPlants());
		const first = result.current;

		await rerender({});

		expect(result.current).toBe(first);
	});
});
