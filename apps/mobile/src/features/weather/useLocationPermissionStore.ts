import * as Location from "expo-location";
import { Linking } from "react-native";
import { create } from "zustand";

type LocationPermissionState = {
	status: Location.PermissionStatus | null;
	canAskAgain: boolean;
	refresh: () => Promise<void>;
	// Only while the app is in use: the background refresh reuses the last known place
	request: () => Promise<void>;
};

export const useLocationPermissionStore = create<LocationPermissionState>()(
	(set, get) => {
		const apply = ({
			status,
			canAskAgain,
		}: Location.LocationPermissionResponse) => set({ status, canAskAgain });

		return {
			status: null,
			canAskAgain: true,
			refresh: async () =>
				apply(await Location.getForegroundPermissionsAsync()),
			request: async () => {
				try {
					if (!get().canAskAgain) return await Linking.openSettings();
					apply(await Location.requestForegroundPermissionsAsync());
				} catch (error) {
					console.warn("Location permission not asked", error);
				}
			},
		};
	},
);
