import { create } from "zustand";
import { database } from "@/utils/database";

type UserState = {
	name: string | null;
	saveName: (name: string | null) => Promise<void>;
};

// Sync read so the greeting has the name on the first render
const savedName =
	database.getFirstSync<{ name: string | null }>(
		"SELECT name FROM user WHERE id = 1",
	)?.name ?? null;

export const useUserStore = create<UserState>()((set) => ({
	name: savedName,
	saveName: async (name) => {
		await database.runAsync(
			"INSERT INTO user (id, name) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name",
			name,
		);
		set({ name });
	},
}));
