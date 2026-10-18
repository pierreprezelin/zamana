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
export const pickPhoto = async (source: PhotoSource) => {
	if (source === "camera") {
		const { granted } = await requestCameraPermissionsAsync();
		if (!granted) throw new Error(t("plant.photo.cameraDenied"));
	}

	const launch =
		source === "camera" ? launchCameraAsync : launchImageLibraryAsync;
	const result = await launch({
		mediaTypes: "images",
		allowsEditing: true,
		aspect: [1, 1],
		quality: 0.75,
	});
	if (result.canceled) return null;

	const [asset] = result.assets;
	if (asset.fileSize && asset.fileSize > MAX_PHOTO_SIZE) {
		throw new Error(t("plant.photo.tooLarge"));
	}
	return asset.uri;
};

export const savePhoto = async (uri: string) => {
	photosDirectory.create({ intermediates: true, idempotent: true });
	const photo = new File(photosDirectory, `${randomUUID()}.jpg`);
	await new File(uri).copy(photo);
	return photo.name;
};

export const deletePhoto = (filename: string) => {
	const photo = new File(photosDirectory, filename);
	if (photo.exists) photo.delete();
};
