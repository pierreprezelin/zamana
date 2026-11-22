// Tests assert the French texts, the app default language
jest.mock("expo-localization", () => ({
	getLocales: jest.fn(() => [{ languageCode: "fr" }]),
}));

// Needed for react-native-reanimated to work properly in tests
jest.mock("react-native-worklets", () =>
	require("react-native-worklets/lib/module/mock"),
);
