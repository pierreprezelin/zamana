import { reloadAppAsync } from "expo";
import { getLocales } from "expo-localization";
import i18next from "i18next";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncStorage } from "@/utils/syncStorage";

export type Language = "fr" | "en";

export type LanguagePreference = Language | "system";

const isSupported = (code: string | null): code is Language =>
	code === "fr" || code === "en";

export const resolveLanguage = (
	preference: LanguagePreference,
	deviceLocales: { languageCode: string | null }[],
): Language =>
	preference === "system"
		? (deviceLocales
				.map(({ languageCode }) => languageCode)
				.find(isSupported) ?? "en")
		: preference;

type LanguageState = {
	preference: LanguagePreference;
	setPreference: (preference: LanguagePreference) => void;
};

export const useLanguageStore = create<LanguageState>()(
	persist(
		(set) => ({
			preference: "system",
			setPreference: (preference) => {
				set({ preference });
				reloadIfLanguageChanged();
			},
		}),
		{
			name: "language",
			storage: syncStorage,
			partialize: ({ preference }) => ({ preference }),
			// An unknown language would show raw keys, or reload the app on each return
			merge: (persisted, current) => {
				const saved = (persisted as Partial<LanguageState>)?.preference;
				return {
					...current,
					preference:
						saved === "system" || isSupported(saved ?? null)
							? (saved as LanguagePreference)
							: current.preference,
				};
			},
		},
	),
);

export const appLanguage = () =>
	resolveLanguage(useLanguageStore.getState().preference, getLocales());

// Texts translated when their module loaded only change with a fresh start
export const reloadIfLanguageChanged = () => {
	if (appLanguage() !== i18next.language) reloadAppAsync();
};
