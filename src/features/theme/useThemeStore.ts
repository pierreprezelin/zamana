import { Storage } from "expo-sqlite/kv-store";
import { Appearance } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";

type ThemeState = {
	preference: ThemePreference;
	setPreference: (preference: ThemePreference) => void;
};

const applyTheme = (preference: ThemePreference) =>
	Appearance.setColorScheme(
		preference === "system" ? "unspecified" : preference,
	);

// Sync reads so the saved theme is applied before the first render, without a flash
const syncStorage = createJSONStorage(() => ({
	getItem: (key: string) => Storage.getItemSync(key),
	setItem: (key: string, value: string) => Storage.setItemSync(key, value),
	removeItem: (key: string) => {
		Storage.removeItemSync(key);
	},
}));

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			preference: "system",
			setPreference: (preference) => {
				applyTheme(preference);
				set({ preference });
			},
		}),
		{
			name: "theme",
			storage: syncStorage,
			partialize: ({ preference }) => ({ preference }),
			onRehydrateStorage: () => (state) => {
				if (state) applyTheme(state.preference);
			},
		},
	),
);
