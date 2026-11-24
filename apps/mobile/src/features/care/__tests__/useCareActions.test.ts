import Toast from "react-native-toast-message";
import type { Care, CareLog } from "@/features/care/careTypes";
import type { Plant } from "@/features/plants/plantSchema";
import { errorFeedback, successFeedback } from "@/utils/haptics";

const mockStore = {
	markDone: jest.fn(() => Promise.resolve()),
	skipCare: jest.fn(() => Promise.resolve()),
	undo: jest.fn(() => Promise.resolve()),
	setReminder: jest.fn(() => Promise.resolve()),
};

jest.mock("@/utils/haptics");
jest.mock("react-native-toast-message", () => ({ show: jest.fn() }));
jest.mock("@/features/care/useCareStore", () => ({
	useCareStore: { getState: () => mockStore },
}));
jest.mock("@/features/care/useCarePreferencesStore", () => ({
	useCarePreferencesStore: (select: (state: { climate: string }) => unknown) =>
		select({ climate: "north" }),
}));

const { useCareActions } =
	require("@/features/care/useCareActions") as typeof import("@/features/care/useCareActions");

const care = {
	id: "care-1",
	type: "watering",
	frequency: { amount: 1, unit: "week" },
	period: null,
	lastDoneAt: "2026-11-01",
	reminder: true,
} as unknown as Care;
const plant = { id: "plant-1", watering: 2 } as unknown as Plant;
const log = { id: "log-1", type: "watering" } as unknown as CareLog;

beforeEach(() => {
	jest.clearAllMocks();
	jest.useFakeTimers({ now: new Date(2026, 5, 10, 12, 0) });
});
afterEach(() => jest.useRealTimers());

describe("useCareActions", () => {
	it("confirms a care done with the success feedback", async () => {
		await useCareActions().done(care);
		expect(mockStore.markDone).toHaveBeenCalledWith("care-1");
		expect(successFeedback).toHaveBeenCalled();
		expect(errorFeedback).not.toHaveBeenCalled();
	});

	it("signals a failed care with the error feedback and toast", async () => {
		mockStore.markDone.mockRejectedValueOnce(new Error("db"));
		expect(await useCareActions().done(care)).toBe(false);
		expect(errorFeedback).toHaveBeenCalled();
		expect(Toast.show).toHaveBeenCalledWith(
			expect.objectContaining({ type: "error" }),
		);
		expect(successFeedback).not.toHaveBeenCalled();
	});

	it("asks a skipped care again after a quarter of the plant's watering interval", async () => {
		await useCareActions().skip(care, plant);

		// Level 2 in a northern June: watered every 7 days, asked again in 2
		expect(mockStore.skipCare).toHaveBeenCalledWith("care-1", "2026-06-12");
		expect(successFeedback).not.toHaveBeenCalled();
	});

	it("confirms an undo with a toast only once it went through", async () => {
		await useCareActions().undo(log);
		expect(Toast.show).toHaveBeenCalledWith(
			expect.objectContaining({ type: "success" }),
		);

		jest.mocked(Toast.show).mockClear();
		mockStore.undo.mockRejectedValueOnce(new Error("db"));
		await useCareActions().undo(log);
		expect(Toast.show).not.toHaveBeenCalledWith(
			expect.objectContaining({ type: "success" }),
		);
	});
});
