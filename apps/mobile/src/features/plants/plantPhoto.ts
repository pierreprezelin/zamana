import { randomUUID } from "expo-crypto";
import { Directory, File, Paths } from "expo-file-system";
import {
	launchCameraAsync,
	launchImageLibraryAsync,
	requestCameraPermissionsAsync,
} from "expo-image-picker";
import { t } from "@/utils/i18n";

export type PhotoSource = "camera" | "library";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;

// Only the file name is stored: the iOS container path changes between app updates
const photosDirectory = new Directory(Paths.document, "plants");

export const photoUri = (filename: string) =>
	new File(photosDirectory, filename).uri;

// Returns the temporary picked uri, or null if the user cancelled
export const pickPhoto = async (
	source: PhotoSource,
	aspect: [number, number],
) => {
	if (source === "camera") {
		const { granted } = await requestCameraPermissionsAsync();
		if (!granted) throw new Error(t("plant.photo.cameraDenied"));
	}

	const launch =
		source === "camera" ? launchCameraAsync : launchImageLibraryAsync;
	const result = await launch({
		mediaTypes: "images",
		allowsEditing: true,
		aspect,
		quality: 0.75,
	});
	if (result.canceled) return null;

	const [asset] = result.assets;
	if (asset.fileSize && asset.fileSize > MAX_PHOTO_SIZE) {
		throw new Error(t("plant.photo.tooLarge"));
	}
	return asset.uri;
};

// A photo prefilled from the encyclopedia is still on the web
export const isRemotePhoto = (uri: string) => uri.startsWith("https://");

// The save button waits on it: a stalled network must give up rather than spin forever
const DOWNLOAD_TIMEOUT_MS = 20_000;

// Bounded like a picked photo, and never left half-written
const download = async (url: string, photo: File) => {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
	try {
		await File.downloadFileAsync(url, photo, {
			signal: controller.signal,
			onProgress: ({ bytesWritten }) => {
				if (bytesWritten > MAX_PHOTO_SIZE) controller.abort();
			},
		});
	} catch (error) {
		deleteFile(photo);
		throw error;
	} finally {
		clearTimeout(timer);
	}
};

export const savePhoto = async (uri: string) => {
	photosDirectory.create({ intermediates: true, idempotent: true });
	const photo = new File(photosDirectory, `${randomUUID()}.jpg`);
	if (isRemotePhoto(uri)) {
		await download(uri, photo);
	} else {
		await new File(uri).copy(photo);
	}
	return photo.name;
};

// Best effort: a leftover file beats failing an action already saved in the database
const deleteFile = (file: File) => {
	try {
		if (file.exists) file.delete();
	} catch {}
};

export const deletePhoto = (filename: string) =>
	deleteFile(new File(photosDirectory, filename));
