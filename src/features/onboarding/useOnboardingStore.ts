import { create } from "zustand";

type OnboardingState = {
	completed: boolean;
	complete: () => void;
};

// ponytail: in-memory only, onboarding shows on every launch until persisted with expo-sqlite
export const useOnboardingStore = create<OnboardingState>((set) => ({
	completed: false,
	complete: () => set({ completed: true }),
}));
