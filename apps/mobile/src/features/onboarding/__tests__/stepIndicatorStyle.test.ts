import { stepIndicatorStyle } from "@/features/onboarding/stepIndicatorStyle";

// Reanimated 4.7.1 throws when its entry point initializes under Jest
jest.mock("react-native-reanimated", () =>
	require("react-native-reanimated/src/interpolation"),
);

describe("stepIndicatorStyle", () => {
	it("stretches and fully colors the active step", () => {
		expect(stepIndicatorStyle(1, 1)).toEqual({ width: 36, opacity: 1 });
	});

	it("shrinks passed steps to a fully colored dot", () => {
		expect(stepIndicatorStyle(2, 0)).toEqual({ width: 4, opacity: 1 });
	});

	it("shrinks upcoming steps to a faded dot", () => {
		expect(stepIndicatorStyle(0, 2)).toEqual({ width: 4, opacity: 0.5 });
	});

	it("interpolates while swiping between two steps", () => {
		expect(stepIndicatorStyle(0.5, 0)).toEqual({ width: 20, opacity: 1 });
		expect(stepIndicatorStyle(0.5, 1)).toEqual({ width: 20, opacity: 0.75 });
	});
});
