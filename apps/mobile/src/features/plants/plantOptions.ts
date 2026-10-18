import type { IoniconsIconName } from "@/components/ionicons";
import type { Option } from "@/components/OptionList";
import {
	AGE_UNITS,
	ARCHIVE_REASONS,
	type ArchiveReason,
	FLOWERING_TYPES,
	type FloweringType,
	LIFESPANS,
	type Lifespan,
	PLANT_LOCATIONS,
	PLANT_ORIGINS,
	PLANT_TYPES,
	type PlantLocation,
	type PlantOrigin,
	type PlantType,
	SEASONS,
	type Season,
} from "@/features/plants/plantSchema";
import { locale, t } from "@/utils/i18n";

export const plantTypeLabel = (type: PlantType) => t(`plant.type.${type}`);
export const originLabel = (origin: PlantOrigin) => t(`plant.origin.${origin}`);
export const locationLabel = (location: PlantLocation) =>
	t(`plant.location.${location}`);
export const seasonLabel = (season: Season) => t(`plant.season.${season}`);
export const floweringTypeLabel = (type: FloweringType) =>
	t(`plant.floweringType.${type}`);
export const lifespanLabel = (lifespan: Lifespan) =>
	t(`plant.lifespan.${lifespan}`);
export const archiveReasonLabel = (reason: ArchiveReason) =>
	t(`plant.archiveReason.${reason}`);

const toOptions = <T extends string>(
	values: readonly T[],
	label: (value: T) => string,
): Option<T>[] => values.map((value) => ({ value, label: label(value) }));

// Alphabetical in the current language, unlike the lists with a natural order
const toSortedOptions = <T extends string>(
	values: readonly T[],
	label: (value: T) => string,
) =>
	toOptions(values, label).sort((a, b) =>
		a.label.localeCompare(b.label, locale()),
	);

export const plantTypeOptions = toSortedOptions(PLANT_TYPES, plantTypeLabel);
export const originOptions = toSortedOptions(PLANT_ORIGINS, originLabel);
export const locationOptions = toSortedOptions(PLANT_LOCATIONS, locationLabel);
export const seasonOptions = toOptions(SEASONS, seasonLabel);
export const floweringTypeOptions = toOptions(
	FLOWERING_TYPES,
	floweringTypeLabel,
);
export const lifespanOptions = toOptions(LIFESPANS, lifespanLabel);
export const ageUnitOptions = toOptions(AGE_UNITS, (unit) =>
	t(`plant.ageUnit.${unit}`),
);
export const archiveReasonOptions = toOptions(
	ARCHIVE_REASONS,
	archiveReasonLabel,
);

export type NeedKey = "light" | "watering" | "temperature" | "humidity";

type Need = {
	key: NeedKey;
	label: string;
	icon: IoniconsIconName;
	// Short labels fit the form selector, long ones the information tiles
	levels: string[];
	details?: string[];
	helper?: string;
};

export const needs: Need[] = [
	{
		key: "light",
		label: t("plant.needs.light.label"),
		icon: "sunny-outline",
		levels: t("plant.needs.light.levels", { returnObjects: true }),
	},
	{
		key: "watering",
		label: t("plant.needs.watering.label"),
		icon: "water-outline",
		levels: t("plant.needs.watering.levels", { returnObjects: true }),
		details: t("plant.needs.watering.details", { returnObjects: true }),
	},
	{
		key: "temperature",
		label: t("plant.needs.temperature.label"),
		icon: "thermometer-outline",
		levels: t("plant.needs.temperature.levels", { returnObjects: true }),
		helper: t("plant.needs.temperature.helper"),
	},
	{
		key: "humidity",
		label: t("plant.needs.humidity.label"),
		icon: "rainy-outline",
		levels: t("plant.needs.humidity.levels", { returnObjects: true }),
	},
];

export type Help = {
	title: string;
	items: { label: string; text: string }[];
};

export const floweringTypeHelp: Help = {
	title: t("plant.info.floweringType"),
	items: FLOWERING_TYPES.map((type) => ({
		label: floweringTypeLabel(type),
		text: t(`plant.help.${type}`),
	})),
};

export const lifespanHelp: Help = {
	title: t("plant.info.lifespan"),
	items: LIFESPANS.map((lifespan) => ({
		label: lifespanLabel(lifespan),
		text: t(`plant.help.${lifespan}`),
	})),
};
