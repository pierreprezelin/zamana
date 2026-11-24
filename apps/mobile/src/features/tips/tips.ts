import type { Climate } from "@/features/care/careTypes";
import type fr from "@/locales/fr.json";

export type Season = "spring" | "summer" | "autumn" | "winter";

export type Tip = {
	id: keyof typeof fr.tips.items;
	kind: "protip" | "funfact";
	season?: Season;
};

export const TIPS: Tip[] = [
	{ id: "fingerTest", kind: "protip" },
	{ id: "roomTemperatureWater", kind: "protip" },
	{ id: "drainage", kind: "protip" },
	{ id: "dustyLeaves", kind: "protip" },
	{ id: "quarterTurn", kind: "protip" },
	{ id: "yellowLeaves", kind: "protip" },
	{ id: "springRepotting", kind: "protip", season: "spring" },
	{ id: "springFertilizer", kind: "protip", season: "spring" },
	{ id: "summerWateringTime", kind: "protip", season: "summer" },
	{ id: "summerWindowBurn", kind: "protip", season: "summer" },
	{ id: "autumnBringIn", kind: "protip", season: "autumn" },
	{ id: "autumnPests", kind: "protip", season: "autumn" },
	{ id: "winterRadiators", kind: "protip", season: "winter" },
	{ id: "winterLessWater", kind: "protip", season: "winter" },
	{ id: "oldestTree", kind: "funfact" },
	{ id: "bamboo", kind: "funfact" },
	{ id: "mimosa", kind: "funfact" },
	{ id: "banana", kind: "funfact" },
	{ id: "monstera", kind: "funfact" },
	{ id: "cactusSpines", kind: "funfact" },
	{ id: "vanilla", kind: "funfact" },
	{ id: "sunflower", kind: "funfact", season: "summer" },
];

const NORTH_SEASONS: Season[] = ["winter", "spring", "summer", "autumn"];

// Meteorological seasons: winter from December, spring from March...
export const currentSeason = (month: number, climate: Climate) => {
	if (climate === "tropics") return null;
	const northMonth = climate === "south" ? ((month + 5) % 12) + 1 : month;
	return NORTH_SEASONS[Math.floor((northMonth % 12) / 3)] ?? null;
};

type PickTipOptions<T> = {
	tips: T[];
	seenIds: string[];
	season: Season | null;
	random: () => number;
};

export const pickTip = <T extends { id: string; season?: Season }>({
	tips,
	seenIds,
	season,
	random,
}: PickTipOptions<T>) => {
	const unseen = tips.filter(
		(tip) =>
			(!tip.season || tip.season === season) && !seenIds.includes(tip.id),
	);
	return unseen.length ? unseen[Math.floor(random() * unseen.length)] : null;
};
