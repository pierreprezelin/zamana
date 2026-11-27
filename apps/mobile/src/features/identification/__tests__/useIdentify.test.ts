import Toast from "react-native-toast-message";
import { identifyPhoto } from "@/features/identification/useIdentify";
import { usePlantNetStore } from "@/features/identification/usePlantNetStore";
import { deleteFile } from "@/features/plants/plantPhoto";

const mockShrunk = { uri: "file:///cache/shrunk.jpg", name: "shrunk.jpg" };
jest.mock("@/features/plants/plantPhoto", () => ({
	shrinkPhoto: jest.fn(async () => mockShrunk),
	deleteFile: jest.fn(),
}));
jest.mock("react-native-toast-message", () => ({ show: jest.fn() }));

const API_KEY = "2b10fakefakefakefakefake";

const respond = (body: unknown, status = 200) => {
	globalThis.fetch = jest.fn(() =>
		Promise.resolve({
			ok: status === 200,
			status,
			json: () => Promise.resolve(body),
		}),
	) as jest.Mock;
};

beforeEach(() => {
	jest.clearAllMocks();
	usePlantNetStore.setState({ quota: null });
});

describe("identifyPhoto", () => {
	it("suggests the species, counts the identification and deletes the shrunk copy", async () => {
		respond({
			results: [
				{
					score: 0.9,
					species: {
						scientificNameWithoutAuthor: "Ficus elastica",
						commonNames: ["Caoutchouc"],
					},
				},
			],
			remainingIdentificationRequests: 499,
		});

		expect(await identifyPhoto("file:///picked.jpg", API_KEY)).toEqual([
			{
				scientificName: "Ficus elastica",
				commonName: "Caoutchouc",
				score: 0.9,
			},
		]);
		expect(usePlantNetStore.getState().quota?.remaining).toBe(499);
		expect(deleteFile).toHaveBeenCalledWith(mockShrunk);
	});

	it("tells the user why it failed, still deleting the shrunk copy", async () => {
		respond({}, 404);

		expect(await identifyPhoto("file:///picked.jpg", API_KEY)).toBeNull();
		expect(Toast.show).toHaveBeenCalledWith({
			type: "error",
			text1: "Pl@ntNet n’a pas reconnu de plante sur cette photo.",
		});
		expect(deleteFile).toHaveBeenCalled();
	});

	it("shows the quota used up once Pl@ntNet refuses for it", async () => {
		respond({}, 429);

		await identifyPhoto("file:///picked.jpg", API_KEY);

		expect(usePlantNetStore.getState().quota?.remaining).toBe(0);
	});
});
