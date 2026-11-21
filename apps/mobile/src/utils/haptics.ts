import {
	AndroidHaptics,
	NotificationFeedbackType,
	notificationAsync,
	performAndroidHapticsAsync,
	selectionAsync,
} from "expo-haptics";
import { Platform } from "react-native";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncStorage } from "@/utils/syncStorage";

const ANDROID_14 = 34;
const ANDROID_11 = 30;

type HapticsState = {
	enabled: boolean;
	setEnabled: (enabled: boolean) => void;
};

export const useHapticsStore = create<HapticsState>()(
	persist(
		(set) => ({
			enabled: true,
			setEnabled: (enabled) => set({ enabled }),
		}),
		{
			name: "haptics",
			storage: syncStorage,
			partialize: ({ enabled }) => ({ enabled }),
			merge: (persisted, current) => {
				const saved = persisted as Partial<HapticsState>;
				return typeof saved?.enabled === "boolean"
					? { ...current, enabled: saved.enabled }
					: current;
			},
		},
	),
);

// A missing haptic is no reason to surface an error
const play = async (feedback: () => Promise<void>) => {
	if (!useHapticsStore.getState().enabled) return;
	await feedback().catch(() => undefined);
};

// Android's selectionAsync is a faint vibration, the system tick is the native feel
export const selectionFeedback = () =>
	play(() =>
		Platform.OS === "android"
			? performAndroidHapticsAsync(
					Platform.Version >= ANDROID_14
						? AndroidHaptics.Segment_Tick
						: AndroidHaptics.Clock_Tick,
				)
			: selectionAsync(),
	);

// Android's notificationAsync is a raw vibration, the system confirm and reject follow the haptic setting
const outcomeFeedback = (
	androidType: AndroidHaptics,
	type: NotificationFeedbackType,
) =>
	play(() =>
		Platform.OS === "android" && Platform.Version >= ANDROID_11
			? performAndroidHapticsAsync(androidType)
			: notificationAsync(type),
	);

export const successFeedback = () =>
	outcomeFeedback(AndroidHaptics.Confirm, NotificationFeedbackType.Success);

export const errorFeedback = () =>
	outcomeFeedback(AndroidHaptics.Reject, NotificationFeedbackType.Error);
