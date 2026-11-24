import {
	currentSeason,
	pickTip,
	type Season,
	TIPS,
} from "@/features/tips/tips";
import fr from "@/locales/fr.json";

const catalog: { id: string; season?: Season }[] = [
	{ id: "always" },
	{ id: "summer", season: "summer" },
	{ id: "winter", season: "winter" },
];

const pickAll = (seenIds: string[], season: Season | null) =>
	[0, 0.5, 0.99].map(
		(value) =>
			pickTip({ tips: catalog, seenIds, season, random: () => value })?.id,
	);

describe("currentSeason", () => {
	it.each([
		[3, "spring"],
		[5, "spring"],
		[6, "summer"],
		[8, "summer"],
		[9, "autumn"],
		[11, "autumn"],
		[12, "winter"],
		[2, "winter"],
	])("gives month %i in the north as %s", (month, season) => {
		expect(currentSeason(month, "north")).toBe(season);
	});

	it("shifts the seasons by six months in the south", () => {
		expect(currentSeason(1, "south")).toBe("summer");
		expect(currentSeason(7, "south")).toBe("winter");
	});

	it("has no season in the tropics", () => {
		expect(currentSeason(7, "tropics")).toBeNull();
	});
});

describe("pickTip", () => {
	it("only picks tips without a season or of the current one", () => {
		expect(new Set(pickAll([], "summer"))).toEqual(
			new Set(["always", "summer"]),
		);
	});

	it("only picks tips without a season in the tropics", () => {
		expect(new Set(pickAll([], null))).toEqual(new Set(["always"]));
	});

	it("skips the tips already seen", () => {
		expect(new Set(pickAll(["always"], "summer"))).toEqual(new Set(["summer"]));
	});

	it("gives nothing once every eligible tip is seen, unseen ones of other seasons aside", () => {
		expect(pickAll(["always", "summer"], "summer")).toEqual([
			undefined,
			undefined,
			undefined,
		]);
	});
});

describe("TIPS", () => {
	it("has unique ids, each with a translated title and body", () => {
		const ids = TIPS.map((tip) => tip.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const id of ids) {
			expect(fr.tips.items[id].title).toBeTruthy();
			expect(fr.tips.items[id].body).toBeTruthy();
		}
	});
});
