const mockHaptics = {
	selectionAsync: jest.fn(() => Promise.resolve()),
	notificationAsync: jest.fn(() => Promise.resolve()),
	performAndroidHapticsAsync: jest.fn(() => Promise.resolve()),
};

jest.mock("expo-haptics", () => ({
	...mockHaptics,
	AndroidHaptics: {
		Segment_Tick: "segment-tick",
		Clock_Tick: "clock-tick",
		Confirm: "confirm",
		Reject: "reject",
	},
	NotificationFeedbackType: { Success: "success", Error: "error" },
}));

const loadOn = (OS: "ios" | "android", Version: number) => {
	jest.resetModules();
	jest.doMock("react-native", () => ({ Platform: { OS, Version } }));
	return require("@/utils/haptics") as typeof import("@/utils/haptics");
};

beforeEach(() => jest.clearAllMocks());

describe("selectionFeedback", () => {
	it("plays the segment tick from Android 14", () => {
		loadOn("android", 34).selectionFeedback();
		expect(mockHaptics.performAndroidHapticsAsync).toHaveBeenCalledWith(
			"segment-tick",
		);
	});

	it("falls back to the clock tick before Android 14", () => {
		loadOn("android", 33).selectionFeedback();
		expect(mockHaptics.performAndroidHapticsAsync).toHaveBeenCalledWith(
			"clock-tick",
		);
	});

	it("plays the selection feedback on iOS", () => {
		loadOn("ios", 26).selectionFeedback();
		expect(mockHaptics.selectionAsync).toHaveBeenCalled();
	});
});

describe("successFeedback and errorFeedback", () => {
	it("play the system confirm and reject from Android 11", () => {
		const haptics = loadOn("android", 30);
		haptics.successFeedback();
		haptics.errorFeedback();
		expect(mockHaptics.performAndroidHapticsAsync.mock.calls).toEqual([
			["confirm"],
			["reject"],
		]);
	});

	it.each([
		["android", 29],
		["ios", 26],
	] as const)("play the notification feedback on %s %i", (os, version) => {
		const haptics = loadOn(os, version);
		haptics.successFeedback();
		haptics.errorFeedback();
		expect(mockHaptics.notificationAsync.mock.calls).toEqual([
			["success"],
			["error"],
		]);
	});
});

it("swallows a rejection of the native module", async () => {
	mockHaptics.selectionAsync.mockRejectedValueOnce(new Error("unsupported"));
	await expect(loadOn("ios", 26).selectionFeedback()).resolves.toBeUndefined();
});
