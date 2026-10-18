import type { PlantData } from "@/features/plants/plantSchema";

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
				mockRows.set(params[0] as string, { name: params[3] });
			}
			if (sql.startsWith("DELETE")) mockRows.delete(params[0] as string);
		},
	},
}));

const { usePlantStore } =
	require("@/features/plants/usePlantStore") as typeof import("@/features/plants/usePlantStore");

const data: PlantData = {
	photo: "photo.jpg",
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

	it("has no plant by default", () => {
		expect(usePlantStore.getState().plants).toEqual([]);
	});

	it("creates a plant in the database", async () => {
		const id = await usePlantStore.getState().createPlant(data);

		expect(mockRows.get(id)).toEqual({ name: "Monstera" });
		expect(plantOf(id)).toMatchObject({ name: "Monstera", archivedAt: null });
	});

	it("lists the newest plant first", async () => {
		const id = await usePlantStore
			.getState()
			.createPlant({ ...data, name: "Pothos" });

		expect(usePlantStore.getState().plants[0].id).toBe(id);
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
});
