import { File } from "expo-file-system";
import {
	launchCameraAsync,
	launchImageLibraryAsync,
	requestCameraPermissionsAsync,
} from "expo-image-picker";
import { pickPhoto, savePhoto } from "@/features/plants/plantPhoto";

const mockCopy = jest.fn();

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
		delete = jest.fn();
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

	it("copies a photo picked on the phone", async () => {
		expect(await savePhoto("file:///cache/picked.jpg")).toBe("uuid.jpg");
		expect(mockCopy).toHaveBeenCalledWith(
			"file:///cache/picked.jpg",
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

	it("refuses a photo heavier than 2 MB", async () => {
		jest
			.mocked(launchImageLibraryAsync)
			.mockResolvedValueOnce(
				picked(3 * 1024 * 1024) as Awaited<
					ReturnType<typeof launchImageLibraryAsync>
				>,
			);

		await expect(pickPhoto("library", [1, 1])).rejects.toThrow(
			"La photo ne doit pas dépasser 2 Mo.",
		);
	});
});
