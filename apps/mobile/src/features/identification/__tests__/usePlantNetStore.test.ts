import type * as SecureStoreModule from "expo-secure-store";
import { Storage } from "expo-sqlite/kv-store";

// The mock itself, which the stores created in isolation also use
const SecureStore =
	jest.requireMock<typeof SecureStoreModule>("expo-secure-store");

const STORED_KEY = "plantNetApiKey";
const API_KEY = "2b10fakefakefakefakefake";

// The key is read once, when the store is created
const freshStore = () => {
	let store!: typeof import("@/features/identification/usePlantNetStore").usePlantNetStore;
	jest.isolateModules(() => {
		store =
			require("@/features/identification/usePlantNetStore").usePlantNetStore;
	});
	return store;
};

beforeEach(async () => {
	Storage.removeItemSync("plantNet");
	await SecureStore.deleteItemAsync(STORED_KEY);
});

describe("usePlantNetStore", () => {
	it("has no key at first", () => {
		expect(freshStore().getState().apiKey).toBeNull();
	});

	it("saves a valid key without its spaces, in the secure store", () => {
		const store = freshStore();

		expect(store.getState().setApiKey(` ${API_KEY} `)).toBe("saved");

		expect(store.getState().apiKey).toBe(API_KEY);
		expect(SecureStore.getItem(STORED_KEY)).toBe(API_KEY);
		expect(freshStore().getState().apiKey).toBe(API_KEY);
	});

	it("refuses an invalid key and keeps the former one", () => {
		const store = freshStore();
		store.getState().setApiKey(API_KEY);

		expect(store.getState().setApiKey("not a key")).toBe("invalid");

		expect(store.getState().apiKey).toBe(API_KEY);
	});

	it("ignores an invalid key read from the secure store", () => {
		SecureStore.setItem(STORED_KEY, "not a key");

		expect(freshStore().getState().apiKey).toBeNull();
	});

	it("forgets the key and its quota", async () => {
		const store = freshStore();
		store.getState().setApiKey(API_KEY);
		store.getState().setQuota({
			day: "2026-11-27",
			count: 1,
			total: 500,
			remaining: 499,
		});

		await store.getState().clearApiKey();

		expect(store.getState().apiKey).toBeNull();
		expect(store.getState().quota).toBeNull();
		expect(freshStore().getState().apiKey).toBeNull();
	});

	it("updates the quota from the remaining identifications", () => {
		const store = freshStore();
		store.getState().setQuota({
			day: "2026-11-26",
			count: 0,
			total: 1000,
			remaining: 1000,
		});

		store.getState().updateRemaining(997, new Date("2026-11-27T10:00:00Z"));

		expect(store.getState().quota).toEqual({
			day: "2026-11-27",
			count: 3,
			total: 1000,
			remaining: 997,
		});
	});

	it("counts on the free quota when none was read yet", () => {
		const store = freshStore();

		store.getState().updateRemaining(499, new Date("2026-11-27T10:00:00Z"));

		expect(store.getState().quota).toEqual({
			day: "2026-11-27",
			count: 1,
			total: 500,
			remaining: 499,
		});
	});

	it("keeps no key the secure store could not save", () => {
		const store = freshStore();
		jest.spyOn(SecureStore, "setItem").mockImplementationOnce(() => {
			throw new Error("Keystore unavailable");
		});

		expect(store.getState().setApiKey(API_KEY)).toBe("failed");

		expect(store.getState().apiKey).toBeNull();
	});

	it("keeps the key the secure store could not delete", async () => {
		const store = freshStore();
		store.getState().setApiKey(API_KEY);
		jest
			.spyOn(SecureStore, "deleteItemAsync")
			.mockRejectedValueOnce(new Error("Keystore unavailable"));

		await expect(store.getState().clearApiKey()).rejects.toThrow();

		expect(store.getState().apiKey).toBe(API_KEY);
	});

	it("keeps the key on this device only", () => {
		const setItem = jest.spyOn(SecureStore, "setItem");

		freshStore().getState().setApiKey(API_KEY);

		expect(setItem).toHaveBeenCalledWith("plantNetApiKey", API_KEY, {
			keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
		});
	});
});
