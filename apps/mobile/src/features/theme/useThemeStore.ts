import { Appearance } from "react-native";
import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mergePersisted } from "@/utils/mergePersisted";
import { syncStorage } from "@/utils/syncStorage";

export type ThemePreference = "light" | "dark" | "system";

type ThemeState = {
	preference: ThemePreference;
	setPreference: (preference: ThemePreference) => void;
};

const applyTheme = (preference: ThemePreference) =>
	Appearance.setColorScheme(
		preference === "system" ? "unspecified" : preference,
	);

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
			merge: mergePersisted<ThemeState>({
				preference: z.enum(["light", "dark", "system"]),
			}),
			onRehydrateStorage: () => (state) => {
				if (state) applyTheme(state.preference);
			},
		},
	),
);
