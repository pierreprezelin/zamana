// Tests assert the French texts, the app default language
jest.mock("expo-localization", () => ({
	getLocales: jest.fn(() => [{ languageCode: "fr" }]),
}));

// Needed for react-native-reanimated to work properly in tests
jest.mock("react-native-worklets", () =>
	require("react-native-worklets/lib/module/mock"),
);

// The stores persist through it: an in-memory stand-in, one per test file
const mockStoredItems = new Map();
jest.mock("expo-sqlite/kv-store", () => ({
	Storage: {
		getItemSync: (key) => mockStoredItems.get(key) ?? null,
		setItemSync: (key, value) => mockStoredItems.set(key, value),
		removeItemSync: (key) => mockStoredItems.delete(key),
		clearSync: () => mockStoredItems.clear(),
	},
}));
