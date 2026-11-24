import type { Locale } from "@/i18n";
import careEn from "./en/care.png";
import knowledgeEn from "./en/knowledge.png";
import gardenEn from "./en/garden.png";
import plantEn from "./en/plant.png";
import todayEn from "./en/today.png";
import careFr from "./fr/care.png";
import knowledgeFr from "./fr/knowledge.png";
import gardenFr from "./fr/garden.png";
import plantFr from "./fr/plant.png";
import todayFr from "./fr/today.png";

export const screens = {
	fr: { care: careFr, knowledge: knowledgeFr, garden: gardenFr, plant: plantFr, today: todayFr },
	en: { care: careEn, knowledge: knowledgeEn, garden: gardenEn, plant: plantEn, today: todayEn },
} satisfies Record<Locale, Record<string, ImageMetadata>>;
