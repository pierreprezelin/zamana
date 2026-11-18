// Needed for react-native-reanimated to work properly in tests
jest.mock("react-native-worklets", () =>
	require("react-native-worklets/lib/module/mock"),
);
jest.mock("react-native-reanimated", () =>
	require("react-native-reanimated/mock"),
);
