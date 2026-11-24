import * as Location from "expo-location";
import { roundCoordinate } from "@/features/weather/openMeteo";
import { useLocationPermissionStore } from "@/features/weather/useLocationPermissionStore";
import { samePlace, useWeatherStore } from "@/features/weather/useWeatherStore";
import type { Place } from "@/features/weather/weatherTypes";

const placeName = async (latitude: number, longitude: number) => {
	const [address] = await Location.reverseGeocodeAsync({
		latitude,
		longitude,
	}).catch(() => []);
	const name = [address?.city, address?.country].filter(Boolean).join(", ");
	return name || `${latitude}, ${longitude}`;
};

const POSITION_TIMEOUT_MS = 10_000;

// Without a fix, the system can wait for one forever
const currentPosition = () =>
	new Promise<Location.LocationObject>((resolve, reject) => {
		const timer = setTimeout(
			() => reject(new Error("No position in time")),
			POSITION_TIMEOUT_MS,
		);
		Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low })
			.then(resolve, reject)
			.finally(() => clearTimeout(timer));
	});

// Rounded like what is sent to the weather service, or null without the permission
const readPosition = async () => {
	await useLocationPermissionStore.getState().refresh();
	if (useLocationPermissionStore.getState().status !== "granted") return null;
	const position =
		(await Location.getLastKnownPositionAsync()) ?? (await currentPosition());
	return {
		latitude: roundCoordinate(position.coords.latitude),
		longitude: roundCoordinate(position.coords.longitude),
	};
};

const withName = async ({
	latitude,
	longitude,
}: Pick<Place, "latitude" | "longitude">): Promise<Place> => ({
	name: await placeName(latitude, longitude),
	latitude,
	longitude,
});

export const refreshDevicePlace = async () => {
	if (useWeatherStore.getState().source !== "device") return;
	const position = await readPosition();
	if (!position) return;
	// Same place: no new geocoding, no write, no refetch
	if (samePlace(useWeatherStore.getState().place, position)) return;
	useWeatherStore.getState().setDevicePlace(await withName(position));
};

// The chosen city stays until the position can replace it. False when none was found
export const switchToDevicePlace = async () => {
	const position = await readPosition().catch(() => null);
	if (!position) return false;
	useWeatherStore.getState().chooseDevice(await withName(position));
	return true;
};
