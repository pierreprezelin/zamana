const mockStoredItems = new Map<string, string>();

jest.mock("expo-sqlite/kv-store", () => ({
	Storage: {
		getItemSync: (key: string) => mockStoredItems.get(key) ?? null,
		setItemSync: (key: string, value: string) =>
			mockStoredItems.set(key, value),
		removeItemSync: (key: string) => mockStoredItems.delete(key),
	},
}));

const { useOnboardingStore } =
	require("@/features/onboarding/useOnboardingStore") as typeof import("@/features/onboarding/useOnboardingStore");

describe("useOnboardingStore", () => {
	it("is not completed on first launch", () => {
		expect(useOnboardingStore.getState().completed).toBe(false);
	});

	it("saves the completion", () => {
		useOnboardingStore.getState().complete();

		expect(mockStoredItems.get("onboarding")).toContain('"completed":true');
	});

	it("restores the completion on launch", () => {
		useOnboardingStore.setState({ completed: false });
		mockStoredItems.set(
			"onboarding",
			JSON.stringify({ state: { completed: true }, version: 0 }),
		);

		useOnboardingStore.persist.rehydrate();

		expect(useOnboardingStore.getState().completed).toBe(true);
	});
});
