import { Appearance } from "react-native";

const mockStoredItems = new Map<string, string>();

jest.mock("expo-sqlite/kv-store", () => ({
	Storage: {
		getItemSync: (key: string) => mockStoredItems.get(key) ?? null,
		setItemSync: (key: string, value: string) =>
			mockStoredItems.set(key, value),
		removeItemSync: (key: string) => mockStoredItems.delete(key),
	},
}));

const setColorScheme = jest
	.spyOn(Appearance, "setColorScheme")
	.mockImplementation(() => {});

const { useThemeStore } =
	require("@/features/theme/useThemeStore") as typeof import("@/features/theme/useThemeStore");

describe("useThemeStore", () => {
	it("follows the system theme by default", () => {
		expect(useThemeStore.getState().preference).toBe("system");
		expect(setColorScheme).toHaveBeenLastCalledWith("unspecified");
	});

	it("applies and saves the chosen theme", () => {
		useThemeStore.getState().setPreference("dark");

		expect(setColorScheme).toHaveBeenLastCalledWith("dark");
		expect(mockStoredItems.get("theme")).toContain('"preference":"dark"');
	});

	it("restores the saved theme on launch", () => {
		mockStoredItems.set(
			"theme",
			JSON.stringify({ state: { preference: "light" }, version: 0 }),
		);

		useThemeStore.persist.rehydrate();

		expect(useThemeStore.getState().preference).toBe("light");
		expect(setColorScheme).toHaveBeenLastCalledWith("light");
	});
});
