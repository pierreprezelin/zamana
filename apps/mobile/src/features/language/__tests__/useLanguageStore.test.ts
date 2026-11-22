import { reloadAppAsync } from "expo";
import { getLocales } from "expo-localization";

const mockStoredItems = new Map<string, string>();

jest.mock("expo-sqlite/kv-store", () => ({
	Storage: {
		getItemSync: (key: string) => mockStoredItems.get(key) ?? null,
		setItemSync: (key: string, value: string) =>
			mockStoredItems.set(key, value),
		removeItemSync: (key: string) => mockStoredItems.delete(key),
	},
}));

jest.mock("expo", () => ({ reloadAppAsync: jest.fn() }));

const { reloadIfLanguageChanged, resolveLanguage, useLanguageStore } =
	require("@/features/language/useLanguageStore") as typeof import("@/features/language/useLanguageStore");
// Initializes i18next in French, like the app launched on a French phone
require("@/utils/i18n");

const deviceLocales = (...languageCodes: (string | null)[]) =>
	languageCodes.map((languageCode) => ({ languageCode }));

const setDeviceLocales = (...languageCodes: string[]) =>
	jest
		.mocked(getLocales)
		.mockReturnValue(
			deviceLocales(...languageCodes) as ReturnType<typeof getLocales>,
		);

beforeEach(() => {
	jest.mocked(reloadAppAsync).mockClear();
	setDeviceLocales("fr");
	useLanguageStore.setState({ preference: "system" });
});

describe("resolveLanguage", () => {
	it.each([
		[["fr"], "fr"],
		[["en"], "en"],
		[["es", "fr"], "fr"],
		[["de"], "en"],
		[[], "en"],
		[[null, "fr"], "fr"],
	] as const)("follows the phone languages %j → %s", (codes, expected) => {
		expect(resolveLanguage("system", deviceLocales(...codes))).toBe(expected);
	});

	it("prefers the language chosen in the app over the phone's", () => {
		expect(resolveLanguage("en", deviceLocales("fr"))).toBe("en");
		expect(resolveLanguage("fr", deviceLocales("de"))).toBe("fr");
	});
});

describe("useLanguageStore", () => {
	it("follows the phone language by default", () => {
		expect(useLanguageStore.getState().preference).toBe("system");
	});

	it("saves the chosen language and reloads the app in it", () => {
		useLanguageStore.getState().setPreference("en");

		expect(mockStoredItems.get("language")).toContain('"preference":"en"');
		expect(reloadAppAsync).toHaveBeenCalledTimes(1);
	});

	it("does not reload when the displayed language stays the same", () => {
		useLanguageStore.getState().setPreference("fr");

		expect(reloadAppAsync).not.toHaveBeenCalled();
	});

	it("restores the saved language on launch", () => {
		mockStoredItems.set(
			"language",
			JSON.stringify({ state: { preference: "en" }, version: 0 }),
		);

		useLanguageStore.persist.rehydrate();

		expect(useLanguageStore.getState().preference).toBe("en");
	});

	it.each(["de", null])(
		"falls back to the phone language from an unreadable saved %p",
		(saved) => {
			mockStoredItems.set(
				"language",
				JSON.stringify({ state: { preference: saved }, version: 0 }),
			);

			useLanguageStore.persist.rehydrate();

			expect(useLanguageStore.getState().preference).toBe("system");
		},
	);
});

describe("reloadIfLanguageChanged", () => {
	it("reloads the app when the phone language changed meanwhile", () => {
		setDeviceLocales("en");

		reloadIfLanguageChanged();

		expect(reloadAppAsync).toHaveBeenCalledTimes(1);
	});

	it("keeps the app running when the language did not change", () => {
		reloadIfLanguageChanged();

		expect(reloadAppAsync).not.toHaveBeenCalled();
	});
});
