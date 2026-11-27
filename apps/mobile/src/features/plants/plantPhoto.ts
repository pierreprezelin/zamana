import { randomUUID } from "expo-crypto";
import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import {
	launchCameraAsync,
	launchImageLibraryAsync,
	requestCameraPermissionsAsync,
} from "expo-image-picker";
import { t } from "@/utils/i18n";

export type PhotoSource = "camera" | "library";

// Its message is translated and meant for the user, unlike a system error
export class PhotoError extends Error {}

// A remote photo is not shrunk: iNaturalist's large ones stay well below
const MAX_DOWNLOAD_SIZE = 2 * 1024 * 1024;
// Sharp on any phone screen, a few hundred KB instead of several MB
const MAX_PHOTO_SIDE = 1280;
const PHOTO_QUALITY = 0.8;

// Only the file name is stored: the iOS container path changes between app updates
const photosDirectory = new Directory(Paths.document, "plants");

// Read once: photoUri runs on every render of every photo
let photosUri: string | undefined;

export const photoUri = (filename: string) => {
	photosUri ??= photosDirectory.uri.replace(/\/?$/, "/");
	return `${photosUri}${filename}`;
};

// Returns the temporary picked uri, or null if the user cancelled
export const pickPhoto = async (
	source: PhotoSource,
	aspect: [number, number],
) => {
	if (source === "camera") {
		const { granted } = await requestCameraPermissionsAsync();
		if (!granted) throw new PhotoError(t("plant.photo.cameraDenied"));
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

	return result.assets[0]?.uri ?? null;
};

// A photo prefilled from the encyclopedia is still on the web
export const isRemotePhoto = (uri: string) => uri.startsWith("https://");

// The save button waits on it: a stalled network must give up rather than spin forever
const DOWNLOAD_TIMEOUT_MS = 20_000;

// Bounded, and never left half-written
const download = async (url: string, photo: File) => {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
	try {
		await File.downloadFileAsync(url, photo, {
			signal: controller.signal,
			onProgress: ({ bytesWritten }) => {
				if (bytesWritten > MAX_DOWNLOAD_SIZE) controller.abort();
			},
		});
	} catch (error) {
		deleteFile(photo);
		throw error;
	} finally {
		clearTimeout(timer);
	}
};

// A temporary file, to delete once used. Re-encoding also drops the metadata, like the GPS position of the shot
export const shrinkPhoto = async (uri: string) => {
	const image = await ImageManipulator.manipulate(uri, {
		maxWidth: MAX_PHOTO_SIDE,
		maxHeight: MAX_PHOTO_SIDE,
	}).renderAsync();
	const { uri: shrunkUri } = await image.saveAsync({
		compress: PHOTO_QUALITY,
		format: SaveFormat.JPEG,
	});
	return new File(shrunkUri);
};

const saveShrunk = async (uri: string, photo: File) => {
	const shrunk = await shrinkPhoto(uri);
	try {
		await shrunk.copy(photo);
	} finally {
		deleteFile(shrunk);
	}
};

export const savePhoto = async (uri: string) => {
	photosDirectory.create({ intermediates: true, idempotent: true });
	const photo = new File(photosDirectory, `${randomUUID()}.jpg`);
	if (isRemotePhoto(uri)) {
		await download(uri, photo);
	} else {
		await saveShrunk(uri, photo);
	}
	return photo.name;
};

// Best effort: a leftover file beats failing an action already saved in the database
export const deleteFile = (file: File) => {
	try {
		if (file.exists) file.delete();
	} catch {}
};

// Named by savePhoto: anything else, like a path read from a restored backup, is left alone
const PHOTO_NAME = /^[0-9a-f-]{36}\.jpg$/;

export const deletePhoto = (filename: string) => {
	if (PHOTO_NAME.test(filename)) {
		deleteFile(new File(photosDirectory, filename));
	}
};
