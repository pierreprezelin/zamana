import { randomUUID } from "expo-crypto";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { HistoryEntryInput } from "@/features/history/historySchema";
import type { HistoryEntry } from "@/features/history/historyTypes";
import { deletePhoto } from "@/features/plants/plantPhoto";
import { database } from "@/utils/database";

type HistoryEntryRow = {
	id: string;
	plant_id: string;
	photo: string | null;
	note: string | null;
	created_at: string;
	updated_at: string;
};

const toEntry = (row: HistoryEntryRow): HistoryEntry => ({
	id: row.id,
	plantId: row.plant_id,
	photo: row.photo,
	note: row.note,
	createdAt: row.created_at,
	updatedAt: row.updated_at,
});

type HistoryState = {
	entries: HistoryEntry[];
	createEntry: (plantId: string, input: HistoryEntryInput) => Promise<string>;
	updateEntry: (id: string, input: HistoryEntryInput) => Promise<void>;
	deleteEntry: (id: string) => Promise<void>;
	forgetPlant: (plantId: string) => void;
};

// Sync read so the edit screen has its entry on the first render
const savedEntries = database
	.getAllSync<HistoryEntryRow>("SELECT * FROM history_entry")
	.map(toEntry);

export const useHistoryStore = create<HistoryState>()((set, get) => {
	const findEntry = (id: string) =>
		get().entries.find((entry) => entry.id === id);

	return {
		entries: savedEntries,
		createEntry: async (plantId, { photo, note }) => {
			const now = new Date().toISOString();
			const entry: HistoryEntry = {
				id: randomUUID(),
				plantId,
				photo,
				note,
				createdAt: now,
				updatedAt: now,
			};
			await database.runAsync(
				`INSERT INTO history_entry (id, plant_id, photo, note, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?)`,
				entry.id,
				plantId,
				photo,
				note,
				now,
				now,
			);
			set(({ entries }) => ({ entries: [...entries, entry] }));
			return entry.id;
		},
		updateEntry: async (id, { photo, note }) => {
			const previousPhoto = findEntry(id)?.photo;
			const now = new Date().toISOString();
			await database.runAsync(
				"UPDATE history_entry SET photo = ?, note = ?, updated_at = ? WHERE id = ?",
				photo,
				note,
				now,
				id,
			);
			set(({ entries }) => ({
				entries: entries.map((entry) =>
					entry.id === id ? { ...entry, photo, note, updatedAt: now } : entry,
				),
			}));
			if (previousPhoto && previousPhoto !== photo) deletePhoto(previousPhoto);
		},
		deleteEntry: async (id) => {
			const photo = findEntry(id)?.photo;
			await database.runAsync("DELETE FROM history_entry WHERE id = ?", id);
			set(({ entries }) => ({
				entries: entries.filter((entry) => entry.id !== id),
			}));
			if (photo) deletePhoto(photo);
		},
		// The database cascades the plant deletion, only the memory and the files are left
		forgetPlant: (plantId) => {
			const forgotten = get().entries.filter(
				(entry) => entry.plantId === plantId,
			);
			set(({ entries }) => ({
				entries: entries.filter((entry) => entry.plantId !== plantId),
			}));
			for (const { photo } of forgotten) if (photo) deletePhoto(photo);
		},
	};
});

export const usePlantEntries = (plantId: string) =>
	useHistoryStore(
		useShallow((state) =>
			state.entries.filter((entry) => entry.plantId === plantId),
		),
	);

export const useEntry = (id: string | undefined) =>
	useHistoryStore((state) => state.entries.find((entry) => entry.id === id));
