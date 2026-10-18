import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncStorage } from "@/utils/syncStorage";

type OnboardingState = {
	completed: boolean;
	complete: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
	persist(
		(set) => ({
			completed: false,
			complete: () => set({ completed: true }),
		}),
		{
			name: "onboarding",
			storage: syncStorage,
			partialize: ({ completed }) => ({ completed }),
		},
	),
);
