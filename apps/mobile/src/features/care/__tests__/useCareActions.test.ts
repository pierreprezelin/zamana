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

beforeEach(() => jest.clearAllMocks());

describe("useCareActions", () => {
	it("confirms a care done with the success feedback", async () => {
		await useCareActions().done(care);
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

	it("keeps skip and undo silent", async () => {
		const actions = useCareActions();
		await actions.skip(care, plant);
		await actions.undo(log);
		expect(successFeedback).not.toHaveBeenCalled();
		expect(errorFeedback).not.toHaveBeenCalled();
	});
});
