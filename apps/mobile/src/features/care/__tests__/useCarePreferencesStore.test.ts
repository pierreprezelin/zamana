import { Storage } from "expo-sqlite/kv-store";

const { useCarePreferencesStore } =
	require("@/features/care/useCarePreferencesStore") as typeof import("@/features/care/useCarePreferencesStore");

const state = () => useCarePreferencesStore.getState();
const restore = (saved: unknown) => {
	Storage.setItemSync(
		"carePreferences",
		JSON.stringify({ state: saved, version: 0 }),
	);
	useCarePreferencesStore.persist.rehydrate();
};

describe("useCarePreferencesStore", () => {
	beforeEach(() =>
		useCarePreferencesStore.setState(useCarePreferencesStore.getInitialState()),
	);

	it("starts in the north, swiping left to mark a task done", () => {
		expect(useCarePreferencesStore.getInitialState()).toMatchObject({
			climate: "north",
			swipeLeft: "done",
		});
	});

	it("saves the chosen climate and swipe action", () => {
		state().setClimate("tropics");
		state().setSwipeLeft("skip");

		expect(
			JSON.parse(Storage.getItemSync("carePreferences") ?? "{}").state,
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
