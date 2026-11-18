import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Climate } from "@/features/care/careTypes";
import { syncStorage } from "@/utils/syncStorage";

export const SWIPE_RIGHT_ACTIONS = ["done", "skip"] as const;
export type SwipeRightAction = (typeof SWIPE_RIGHT_ACTIONS)[number];

type CarePreferencesState = {
	climate: Climate;
	swipeRight: SwipeRightAction;
	setClimate: (climate: Climate) => void;
	setSwipeRight: (action: SwipeRightAction) => void;
};

export const useCarePreferencesStore = create<CarePreferencesState>()(
	persist(
		(set) => ({
			climate: "north",
			swipeRight: "done",
			setClimate: (climate) => set({ climate }),
			setSwipeRight: (swipeRight) => set({ swipeRight }),
		}),
		{
			name: "carePreferences",
			storage: syncStorage,
			partialize: ({ climate, swipeRight }) => ({ climate, swipeRight }),
		},
	),
);
