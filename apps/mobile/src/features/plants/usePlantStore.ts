import { randomUUID } from "expo-crypto";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { deletePhoto } from "@/features/plants/plantPhoto";
import type {
	ArchiveReason,
	Plant,
	PlantData,
} from "@/features/plants/plantSchema";
import { database } from "@/utils/database";

type PlantRow = {
	id: string;
	photo: string | null;
	nickname: string | null;
	name: string;
	type: Plant["type"];
	scientific_name: string | null;
	origin: Plant["origin"];
	acquired_at: string | null;
	location: Plant["location"];
	born_at: string | null;
	light: number;
	watering: number;
	temperature: number;
	humidity: number;
	outdoor: number;
	toxic: number;
	flowering_seasons: string;
	flowering_type: Plant["floweringType"];
	lifespan: Plant["lifespan"];
	notes: string | null;
	created_at: string;
	updated_at: string;
	archived_at: string | null;
	archive_reason: ArchiveReason | null;
};

const toPlant = (row: PlantRow): Plant => ({
	id: row.id,
	photo: row.photo,
	nickname: row.nickname,
	name: row.name,
	type: row.type,
	scientificName: row.scientific_name,
	origin: row.origin,
	acquiredAt: row.acquired_at,
	location: row.location,
	bornAt: row.born_at,
	light: row.light,
	watering: row.watering,
	temperature: row.temperature,
	humidity: row.humidity,
	outdoor: Boolean(row.outdoor),
	toxic: Boolean(row.toxic),
	floweringSeasons: JSON.parse(row.flowering_seasons),
	floweringType: row.flowering_type,
	lifespan: row.lifespan,
	notes: row.notes,
	createdAt: row.created_at,
	updatedAt: row.updated_at,
	archivedAt: row.archived_at,
	archiveReason: row.archive_reason,
});

const DATA_COLUMNS = [
	"photo",
	"nickname",
	"name",
	"type",
	"scientific_name",
	"origin",
	"acquired_at",
	"location",
	"born_at",
	"light",
	"watering",
	"temperature",
	"humidity",
	"outdoor",
	"toxic",
	"flowering_seasons",
	"flowering_type",
	"lifespan",
	"notes",
];

// Same order as DATA_COLUMNS
const toParams = (data: PlantData) => [
	data.photo,
	data.nickname,
	data.name,
	data.type,
	data.scientificName,
	data.origin,
	data.acquiredAt,
	data.location,
	data.bornAt,
	data.light,
	data.watering,
	data.temperature,
	data.humidity,
	Number(data.outdoor),
	Number(data.toxic),
	JSON.stringify(data.floweringSeasons),
	data.floweringType,
	data.lifespan,
	data.notes,
];

type PlantState = {
	plants: Plant[];
	createPlant: (data: PlantData) => Promise<string>;
	updatePlant: (id: string, data: PlantData) => Promise<void>;
	archivePlant: (id: string, reason: ArchiveReason) => Promise<void>;
	restorePlant: (id: string) => Promise<void>;
	deletePlant: (id: string) => Promise<void>;
};

// Sync read so the screens have the plants on the first render
const savedPlants = database
	.getAllSync<PlantRow>("SELECT * FROM plant ORDER BY created_at DESC")
	.map(toPlant);

export const usePlantStore = create<PlantState>()((set, get) => {
	const findPlant = (id: string) =>
		get().plants.find((plant) => plant.id === id);

	const patchPlant = (id: string, patch: Partial<Plant>) =>
		set(({ plants }) => ({
			plants: plants.map((plant) =>
				plant.id === id ? { ...plant, ...patch } : plant,
			),
		}));

	const setArchive = async (id: string, reason: ArchiveReason | null) => {
		const archivedAt = reason ? new Date().toISOString() : null;
		await database.runAsync(
			"UPDATE plant SET archived_at = ?, archive_reason = ? WHERE id = ?",
			archivedAt,
			reason,
			id,
		);
		patchPlant(id, { archivedAt, archiveReason: reason });
	};

	return {
		plants: savedPlants,
		createPlant: async (data) => {
			const id = randomUUID();
			const now = new Date().toISOString();
			await database.runAsync(
				`INSERT INTO plant (id, ${DATA_COLUMNS.join(", ")}, created_at, updated_at)
				VALUES (?, ${DATA_COLUMNS.map(() => "?").join(", ")}, ?, ?)`,
				id,
				...toParams(data),
				now,
				now,
			);
			const plant: Plant = {
				...data,
				id,
				createdAt: now,
				updatedAt: now,
				archivedAt: null,
				archiveReason: null,
			};
			set(({ plants }) => ({ plants: [plant, ...plants] }));
			return id;
		},
		updatePlant: async (id, data) => {
			const previousPhoto = findPlant(id)?.photo;
			const now = new Date().toISOString();
			await database.runAsync(
				`UPDATE plant SET ${DATA_COLUMNS.map((column) => `${column} = ?`).join(", ")}, updated_at = ?
				WHERE id = ?`,
				...toParams(data),
				now,
				id,
			);
			patchPlant(id, { ...data, updatedAt: now });
			if (previousPhoto && previousPhoto !== data.photo) {
				deletePhoto(previousPhoto);
			}
		},
		archivePlant: (id, reason) => setArchive(id, reason),
		restorePlant: (id) => setArchive(id, null),
		deletePlant: async (id) => {
			const photo = findPlant(id)?.photo;
			await database.runAsync("DELETE FROM plant WHERE id = ?", id);
			set(({ plants }) => ({
				plants: plants.filter((plant) => plant.id !== id),
			}));
			if (photo) deletePhoto(photo);
		},
	};
});

export const usePlant = (id: string) =>
	usePlantStore((state) => state.plants.find((plant) => plant.id === id));

export const useCurrentPlants = () =>
	usePlantStore(
		useShallow((state) => state.plants.filter((plant) => !plant.archivedAt)),
	);

export const usePastPlants = () =>
	usePlantStore(
		useShallow((state) => state.plants.filter((plant) => plant.archivedAt)),
	);
