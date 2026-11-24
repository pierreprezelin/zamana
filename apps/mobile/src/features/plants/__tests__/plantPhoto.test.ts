import { File } from "expo-file-system";
import { ImageManipulator } from "expo-image-manipulator";
import {
	launchCameraAsync,
	launchImageLibraryAsync,
	requestCameraPermissionsAsync,
} from "expo-image-picker";
import {
	deletePhoto,
	PhotoError,
	pickPhoto,
	savePhoto,
} from "@/features/plants/plantPhoto";

const mockCopy = jest.fn();
const mockDelete = jest.fn();
const mockSave = jest.fn(() =>
	Promise.resolve({ uri: "file:///cache/small.jpg" }),
);

jest.mock("expo-image-manipulator", () => ({
	SaveFormat: { JPEG: "jpeg" },
	ImageManipulator: {
		manipulate: jest.fn(() => ({
			renderAsync: () => Promise.resolve({ saveAsync: mockSave }),
		})),
	},
}));

jest.mock("expo-crypto", () => ({ randomUUID: () => "uuid" }));

jest.mock("expo-image-picker", () => ({
	launchCameraAsync: jest.fn(),
	launchImageLibraryAsync: jest.fn(),
	requestCameraPermissionsAsync: jest.fn(),
}));

jest.mock("expo-file-system", () => {
	class MockFile {
		static downloadFileAsync = jest.fn();
		name: string;
		copy(destination: MockFile) {
			return mockCopy(this.name, destination.name);
		}
		exists = true;
		delete = jest.fn(() => mockDelete(this.name));
		constructor(...parts: unknown[]) {
			this.name = String(parts.at(-1));
		}
	}
	class MockDirectory {
		create = jest.fn();
	}
	return { File: MockFile, Directory: MockDirectory, Paths: { document: "" } };
});

const download = File.downloadFileAsync as jest.Mock;

beforeEach(() => {
	jest.clearAllMocks();
	download.mockReset();
	mockCopy.mockReset();
});

describe("savePhoto", () => {
	it("downloads a photo prefilled from the web", async () => {
		const url = "https://static.inaturalist.org/photos/1/large.jpg";

		expect(await savePhoto(url)).toBe("uuid.jpg");
		expect(download).toHaveBeenCalledWith(
			url,
			expect.any(File),
			expect.objectContaining({ signal: expect.any(AbortSignal) }),
		);
	});

	it("keeps a photo picked on the phone shrunk, as a JPEG without its metadata", async () => {
		expect(await savePhoto("file:///cache/picked.jpg")).toBe("uuid.jpg");
		expect(ImageManipulator.manipulate).toHaveBeenCalledWith(
			"file:///cache/picked.jpg",
			{ maxWidth: 1280, maxHeight: 1280 },
		);
		expect(mockSave).toHaveBeenCalledWith({ compress: 0.8, format: "jpeg" });
		expect(mockCopy).toHaveBeenCalledWith(
			"file:///cache/small.jpg",
			"uuid.jpg",
		);
		expect(download).not.toHaveBeenCalled();
	});

	it("fails when the download does, without leaving a partial file", async () => {
		download.mockImplementationOnce((_url, file: { delete: jest.Mock }) => {
			partial = file;
			return Promise.reject(new Error("offline"));
		});
		let partial: { delete: jest.Mock } | undefined;

		await expect(
			savePhoto("https://static.inaturalist.org/photos/1/large.jpg"),
		).rejects.toThrow("offline");
		expect(partial?.delete).toHaveBeenCalled();
	});

	it("stops a download heavier than a picked photo may be", async () => {
		download.mockImplementationOnce(
			(_url, _file, { onProgress, signal }) =>
				new Promise((_resolve, reject) => {
					signal.addEventListener("abort", () => reject(new Error("aborted")));
					onProgress({ bytesWritten: 3 * 1024 * 1024, totalBytes: -1 });
				}),
		);

		await expect(
			savePhoto("https://static.inaturalist.org/photos/1/original.jpg"),
		).rejects.toThrow();
	});

	it("gives up on a download that does not end", async () => {
		jest.useFakeTimers();
		download.mockImplementationOnce(
			(_url, _file, { signal }) =>
				new Promise((_resolve, reject) => {
					signal.addEventListener("abort", () => reject(new Error("aborted")));
				}),
		);

		const saving = savePhoto(
			"https://static.inaturalist.org/photos/1/large.jpg",
		);
		jest.advanceTimersByTime(30_000);

		await expect(saving).rejects.toThrow();
		jest.useRealTimers();
	});
});

describe("pickPhoto", () => {
	const picked = (fileSize: number) => ({
		canceled: false,
		assets: [{ uri: "file:///cache/picked.jpg", fileSize }],
	});

	it("fails when the camera access is denied", async () => {
		jest.mocked(requestCameraPermissionsAsync).mockResolvedValueOnce({
			granted: false,
		} as Awaited<ReturnType<typeof requestCameraPermissionsAsync>>);

		await expect(pickPhoto("camera", [1, 1])).rejects.toThrow(
			"L’accès à l’appareil photo a été refusé.",
		);
		expect(launchCameraAsync).not.toHaveBeenCalled();
	});

	it("tells the user, in their language, when the camera access is denied", async () => {
		jest.mocked(requestCameraPermissionsAsync).mockResolvedValueOnce({
			granted: false,
		} as Awaited<ReturnType<typeof requestCameraPermissionsAsync>>);

		await expect(pickPhoto("camera", [1, 1])).rejects.toBeInstanceOf(
			PhotoError,
		);
	});

	it("accepts a heavy photo, shrunk once saved", async () => {
		jest
			.mocked(launchImageLibraryAsync)
			.mockResolvedValueOnce(
				picked(8 * 1024 * 1024) as Awaited<
					ReturnType<typeof launchImageLibraryAsync>
				>,
			);

		expect(await pickPhoto("library", [1, 1])).toBe("file:///cache/picked.jpg");
	});
});

describe("deletePhoto", () => {
	it("deletes a photo saved by the app", () => {
		deletePhoto("0b4e7c8a-1f2d-4e5a-9b6c-7d8e9f0a1b2c.jpg");
		expect(mockDelete).toHaveBeenCalledWith(
			"0b4e7c8a-1f2d-4e5a-9b6c-7d8e9f0a1b2c.jpg",
		);
	});

	it.each(["../zamana.db", "../../plants/x.jpg", "photo.png", ""])(
		"never deletes %p, which no photo of the app is named",
		(name) => {
			deletePhoto(name);
			expect(mockDelete).not.toHaveBeenCalled();
		},
	);
});
