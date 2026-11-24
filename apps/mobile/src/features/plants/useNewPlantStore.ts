import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mergePersisted } from "@/utils/mergePersisted";
import { syncStorage } from "@/utils/syncStorage";

type NewPlantState = {
	enabled: boolean;
	dismissedUpTo: string | null;
	dismiss: (plantCreatedAt: string) => void;
	setEnabled: (enabled: boolean) => void;
};

export const useNewPlantStore = create<NewPlantState>()(
	persist(
		(set) => ({
			enabled: true,
			dismissedUpTo: null,
			dismiss: (plantCreatedAt) => set({ dismissedUpTo: plantCreatedAt }),
			setEnabled: (enabled) => set({ enabled }),
		}),
		{
			name: "newPlant",
			storage: syncStorage,
			partialize: ({ enabled, dismissedUpTo }) => ({ enabled, dismissedUpTo }),
			merge: mergePersisted<NewPlantState>({
				enabled: z.boolean(),
				dismissedUpTo: z.string().nullable(),
			}),
		},
	),
);
