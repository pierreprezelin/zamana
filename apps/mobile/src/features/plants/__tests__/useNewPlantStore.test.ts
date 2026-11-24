import { Storage } from "expo-sqlite/kv-store";

const { useNewPlantStore } =
	require("@/features/plants/useNewPlantStore") as typeof import("@/features/plants/useNewPlantStore");

describe("useNewPlantStore", () => {
	beforeEach(() =>
		useNewPlantStore.setState({ enabled: true, dismissedUpTo: null }),
	);

	it("restores the saved preferences on launch", () => {
		Storage.setItemSync(
			"newPlant",
			JSON.stringify({
				state: { enabled: false, dismissedUpTo: "2026-11-22T12:00:00.000Z" },
				version: 0,
			}),
		);
		useNewPlantStore.persist.rehydrate();

		expect(useNewPlantStore.getState()).toMatchObject({
			enabled: false,
			dismissedUpTo: "2026-11-22T12:00:00.000Z",
		});
	});

	it("ignores unreadable saved preferences", () => {
		Storage.setItemSync(
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
