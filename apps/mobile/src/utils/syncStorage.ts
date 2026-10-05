import { Storage } from "expo-sqlite/kv-store";
import { createJSONStorage } from "zustand/middleware";

// Sync reads so persisted stores are hydrated before the first render, without a flash
export const syncStorage = createJSONStorage(() => ({
	getItem: (key: string) => Storage.getItemSync(key),
	setItem: (key: string, value: string) => Storage.setItemSync(key, value),
	removeItem: (key: string) => {
		Storage.removeItemSync(key);
	},
}));
