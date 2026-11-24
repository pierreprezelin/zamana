import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CLIMATES, type Climate } from "@/features/care/careTypes";
import { mergePersisted } from "@/utils/mergePersisted";
import { syncStorage } from "@/utils/syncStorage";

export const SWIPE_LEFT_ACTIONS = ["done", "skip"] as const;
type SwipeLeftAction = (typeof SWIPE_LEFT_ACTIONS)[number];

type CarePreferencesState = {
	climate: Climate;
	swipeLeft: SwipeLeftAction;
	setClimate: (climate: Climate) => void;
	setSwipeLeft: (action: SwipeLeftAction) => void;
};

export const useCarePreferencesStore = create<CarePreferencesState>()(
	persist(
		(set) => ({
			climate: "north",
			swipeLeft: "done",
			setClimate: (climate) => set({ climate }),
			setSwipeLeft: (swipeLeft) => set({ swipeLeft }),
		}),
		{
			name: "carePreferences",
			storage: syncStorage,
			partialize: ({ climate, swipeLeft }) => ({ climate, swipeLeft }),
			// An unknown climate would break the watering schedule
			merge: mergePersisted<CarePreferencesState>({
				climate: z.enum(CLIMATES),
				swipeLeft: z.enum(SWIPE_LEFT_ACTIONS),
			}),
		},
	),
);
