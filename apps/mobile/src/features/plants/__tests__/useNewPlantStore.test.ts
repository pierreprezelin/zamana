const mockStoredItems = new Map<string, string>();

jest.mock("expo-sqlite/kv-store", () => ({
	Storage: {
		getItemSync: (key: string) => mockStoredItems.get(key) ?? null,
		setItemSync: (key: string, value: string) =>
			mockStoredItems.set(key, value),
		removeItemSync: (key: string) => mockStoredItems.delete(key),
	},
}));

const { useNewPlantStore } =
	require("@/features/plants/useNewPlantStore") as typeof import("@/features/plants/useNewPlantStore");

describe("useNewPlantStore", () => {
	beforeEach(() =>
		useNewPlantStore.setState({ enabled: true, dismissedUpTo: null }),
	);

	it("remembers the creation of the dismissed plant, whatever the clock", () => {
		useNewPlantStore.getState().dismiss("2026-11-22T12:00:00.000Z");

		expect(useNewPlantStore.getState().dismissedUpTo).toBe(
			"2026-11-22T12:00:00.000Z",
		);
	});

	it("can be turned off and on", () => {
		useNewPlantStore.getState().setEnabled(false);
		expect(useNewPlantStore.getState().enabled).toBe(false);

		useNewPlantStore.getState().setEnabled(true);
		expect(useNewPlantStore.getState().enabled).toBe(true);
	});

	it("ignores unreadable saved preferences", () => {
		mockStoredItems.set(
			"newPlant",
			JSON.stringify({
				state: { enabled: "false", dismissedUpTo: 42 },
				version: 0,
			}),
		);
		useNewPlantStore.persist.rehydrate();

		expect(useNewPlantStore.getState()).toMatchObject({
			enabled: true,
			dismissedUpTo: null,
		});
	});
});
