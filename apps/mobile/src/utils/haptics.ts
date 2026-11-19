import {
	AndroidHaptics,
	NotificationFeedbackType,
	notificationAsync,
	performAndroidHapticsAsync,
	selectionAsync,
} from "expo-haptics";
import { Platform } from "react-native";

const ANDROID_14 = 34;
const ANDROID_11 = 30;

// A missing haptic is no reason to surface an error
const play = (feedback: () => Promise<void>) =>
	feedback().catch(() => undefined);

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
