import { nextReset, todayQuota } from "@/features/identification/quota";

const quota = { day: "2026-11-27", count: 12, total: 500, remaining: 488 };

describe("todayQuota", () => {
	it("keeps a quota read today, in UTC", () => {
		expect(todayQuota(quota, new Date("2026-11-27T23:30:00Z"))).toEqual(quota);
	});

	it("starts a quota read on a former UTC day over", () => {
		expect(todayQuota(quota, new Date("2026-11-28T00:10:00Z"))).toEqual({
			day: "2026-11-28",
			count: 0,
			total: 500,
			remaining: 500,
		});
	});

	it("knows nothing without a quota read", () => {
		expect(todayQuota(null, new Date())).toBeNull();
	});
});

describe("nextReset", () => {
	it("is the next midnight UTC", () => {
		expect(nextReset(new Date("2026-11-27T15:00:00Z"))).toEqual(
			new Date("2026-11-28T00:00:00Z"),
		);
	});
});
