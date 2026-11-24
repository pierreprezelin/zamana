import type { Locale } from "@/i18n";
import careEn from "./en/care.png";
import encyclopediaEn from "./en/encyclopedia.png";
import gardenEn from "./en/garden.png";
import plantEn from "./en/plant.png";
import todayEn from "./en/today.png";
import careFr from "./fr/care.png";
import encyclopediaFr from "./fr/encyclopedia.png";
import gardenFr from "./fr/garden.png";
import plantFr from "./fr/plant.png";
import todayFr from "./fr/today.png";

export const screens = {
	fr: { care: careFr, encyclopedia: encyclopediaFr, garden: gardenFr, plant: plantFr, today: todayFr },
	en: { care: careEn, encyclopedia: encyclopediaEn, garden: gardenEn, plant: plantEn, today: todayEn },
} satisfies Record<Locale, Record<string, ImageMetadata>>;
