// Tests assert the French texts, the app default language
jest.mock("expo-localization", () => ({
	getLocales: jest.fn(() => [{ languageCode: "fr" }]),
}));

// Needed for react-native-reanimated to work properly in tests
jest.mock("react-native-worklets", () =>
	require("react-native-worklets/lib/module/mock"),
);

// Secrets, like the Pl@ntNet key, are kept apart from the other stores
// One object, so a test spying on it also sees the stores it creates in isolation
const mockSecureItems = new Map();
const mockSecureStore = {
	// Imported as is, not copied, so that spies reach the stores
	__esModule: true,
	WHEN_UNLOCKED_THIS_DEVICE_ONLY: 5,
	getItem: (key) => mockSecureItems.get(key) ?? null,
	setItem: (key, value) => mockSecureItems.set(key, value),
	deleteItemAsync: async (key) => {
		mockSecureItems.delete(key);
	},
};
jest.mock("expo-secure-store", () => mockSecureStore);

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
