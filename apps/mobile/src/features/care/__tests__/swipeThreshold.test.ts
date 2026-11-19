import {
	crossedThreshold,
	SWIPE_THRESHOLD,
} from "@/features/care/swipeThreshold";

describe("crossedThreshold", () => {
	it("is true when the drag goes past the threshold", () => {
		expect(crossedThreshold(SWIPE_THRESHOLD - 1, SWIPE_THRESHOLD)).toBe(true);
	});

	it("is true when the drag comes back under the threshold", () => {
		expect(crossedThreshold(SWIPE_THRESHOLD, SWIPE_THRESHOLD - 1)).toBe(true);
	});

	it.each([
		[10, 20],
		[SWIPE_THRESHOLD, SWIPE_THRESHOLD + 30],
		[-SWIPE_THRESHOLD - 10, -SWIPE_THRESHOLD - 20],
	])("is false while the drag stays on one side (%i → %i)", (from, to) => {
		expect(crossedThreshold(from, to)).toBe(false);
	});

	it("is false on the first frame, without a previous value", () => {
		expect(crossedThreshold(null, SWIPE_THRESHOLD + 10)).toBe(false);
	});
});
