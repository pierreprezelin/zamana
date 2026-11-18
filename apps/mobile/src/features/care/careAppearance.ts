import type { IoniconsIconName } from "@/components/ionicons";
import type { CareType } from "@/features/care/careTypes";

type CareAppearance = {
	icon: IoniconsIconName;
	// Full class names, so Tailwind finds them
	background: string;
	tint: string;
	text: string;
};

const WATER = {
	background: "bg-care-water",
	tint: "bg-care-water-tint",
	text: "text-care-water",
};
const FEED = {
	background: "bg-care-feed",
	tint: "bg-care-feed-tint",
	text: "text-care-feed",
};
const CLEAN = {
	background: "bg-care-clean",
	tint: "bg-care-clean-tint",
	text: "text-care-clean",
};
const REPOT = {
	background: "bg-care-repot",
	tint: "bg-care-repot-tint",
	text: "text-care-repot",
};
const PRUNE = {
	background: "bg-care-prune",
	tint: "bg-care-prune-tint",
	text: "text-care-prune",
};
const TREAT = {
	background: "bg-care-treat",
	tint: "bg-care-treat-tint",
	text: "text-care-treat",
};

const MIST = {
	background: "bg-care-mist",
	tint: "bg-care-mist-tint",
	text: "text-care-mist",
};

export const careAppearance: Record<CareType, CareAppearance> = {
	watering: { icon: "water-outline", ...WATER },
	fertilizing: { icon: "flask-outline", ...FEED },
	leafCleaning: { icon: "sparkles-outline", ...CLEAN },
	repotting: { icon: "cube-outline", ...REPOT },
	pruning: { icon: "cut-outline", ...PRUNE },
	treatment: { icon: "medkit-outline", ...TREAT },
	misting: { icon: "rainy-outline", ...MIST },
};
