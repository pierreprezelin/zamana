const mockStoredItems = new Map<string, string>();

jest.mock("expo-sqlite/kv-store", () => ({
	Storage: {
		getItemSync: (key: string) => mockStoredItems.get(key) ?? null,
		setItemSync: (key: string, value: string) =>
			mockStoredItems.set(key, value),
		removeItemSync: (key: string) => mockStoredItems.delete(key),
	},
}));

const { useCarePreferencesStore } =
	require("@/features/care/useCarePreferencesStore") as typeof import("@/features/care/useCarePreferencesStore");

const state = () => useCarePreferencesStore.getState();
const restore = (saved: unknown) => {
	mockStoredItems.set(
		"carePreferences",
		JSON.stringify({ state: saved, version: 0 }),
	);
	useCarePreferencesStore.persist.rehydrate();
};

describe("useCarePreferencesStore", () => {
	beforeEach(() =>
		useCarePreferencesStore.setState({ climate: "north", swipeLeft: "done" }),
	);

	it("starts in the north, swiping left to mark a task done", () => {
		expect(state()).toMatchObject({ climate: "north", swipeLeft: "done" });
	});

	it("saves the chosen climate and swipe action", () => {
		state().setClimate("tropics");
		state().setSwipeLeft("skip");

		expect(
			JSON.parse(mockStoredItems.get("carePreferences") ?? "{}").state,
		).toEqual({ climate: "tropics", swipeLeft: "skip" });
	});

	it("restores the saved preferences on launch", () => {
		restore({ climate: "south", swipeLeft: "skip" });
		expect(state()).toMatchObject({ climate: "south", swipeLeft: "skip" });
	});

	it("falls back to the defaults from an unreadable save", () => {
		restore({ climate: "equator", swipeLeft: 1 });
		expect(state()).toMatchObject({ climate: "north", swipeLeft: "done" });
	});
});
