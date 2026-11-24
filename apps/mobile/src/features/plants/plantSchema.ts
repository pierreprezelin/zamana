import { z } from "zod";
import { toISODate } from "@/utils/dates";
import { t } from "@/utils/i18n";

export const NICKNAME_MAX_LENGTH = 20;
export const NAME_MAX_LENGTH = 50;
export const SCIENTIFIC_NAME_MAX_LENGTH = 50;
export const NOTES_MAX_LENGTH = 500;
const AGE_MAX = 100;

export const PLANT_TYPES = [
	"bonsai",
	"orchid",
	"shrub",
	"citrus",
	"succulent",
	"cactus",
	"fern",
	"palm",
	"climber",
	"herb",
	"carnivorous",
	"fruitTree",
	"foliage",
] as const;
export const PLANT_ORIGINS = [
	"gift",
	"store",
	"cutting",
	"seed",
	"swap",
	"rescued",
] as const;
export const PLANT_LOCATIONS = [
	"livingRoom",
	"bedroom",
	"kitchen",
	"bathroom",
	"office",
	"entrance",
	"veranda",
] as const;
export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;
export const FLOWERING_TYPES = ["monocarpic", "polycarpic"] as const;
export const LIFESPANS = ["annual", "biennial", "perennial"] as const;
export const AGE_UNITS = ["day", "month", "year"] as const;
// In display order
export const ARCHIVE_REASONS = [
	"dead",
	"given",
	"lost",
	"sold",
	"other",
] as const;

const optionalText = (max: number, tooLongMessage: string) =>
	z
		.string()
		.trim()
		.max(max, tooLongMessage)
		.transform((text) => text || null);

const level = z.int().min(1).max(3);

export const PHOTO_CREDIT_MAX_LENGTH = 200;

export const isInaturalistPhotoPage = (url: string | undefined) =>
	!!url && /^https:\/\/www\.inaturalist\.org\/photos\/\d+$/.test(url);

// The author of a photo from the encyclopedia, as its licence asks
const photoCreditSchema = z.object({
	attribution: z.string().trim().min(1).max(PHOTO_CREDIT_MAX_LENGTH),
	url: z.string().refine(isInaturalistPhotoPage),
});

// A credit the user cannot see nor fix in the form must not block saving: dropped instead
const optionalPhotoCredit = photoCreditSchema.nullable().catch(null);

export const parsePhotoCredit = (stored: string | null) => {
	if (!stored) return null;
	try {
		return optionalPhotoCredit.parse(JSON.parse(stored));
	} catch {
		return null;
	}
};

const storedSeasons = z.array(z.enum(SEASONS)).catch([]);

export const parseSeasons = (stored: string) => {
	try {
		return storedSeasons.parse(JSON.parse(stored));
	} catch {
		return [];
	}
};

const ageSchema = z.object({
	amount: z
		.number()
		.int(t("plant.errors.ageNotInteger"))
		.min(1, t("plant.errors.ageOutOfRange", { max: AGE_MAX }))
		.max(AGE_MAX, t("plant.errors.ageOutOfRange", { max: AGE_MAX })),
	unit: z.enum(AGE_UNITS),
});

export const plantInputSchema = z
	.object({
		photo: z.string().nullable(),
		photoCredit: optionalPhotoCredit,
		nickname: optionalText(
			NICKNAME_MAX_LENGTH,
			t("plant.errors.nicknameTooLong", { max: NICKNAME_MAX_LENGTH }),
		),
		name: z
			.string()
			.trim()
			.min(1, t("plant.errors.nameRequired"))
			.max(
				NAME_MAX_LENGTH,
				t("plant.errors.nameTooLong", { max: NAME_MAX_LENGTH }),
			),
		type: z.enum(PLANT_TYPES).nullable(),
		scientificName: optionalText(
			SCIENTIFIC_NAME_MAX_LENGTH,
			t("plant.errors.scientificNameTooLong", {
				max: SCIENTIFIC_NAME_MAX_LENGTH,
			}),
		),
		origin: z.enum(PLANT_ORIGINS).nullable(),
		acquiredAt: z.iso
			.date()
			.refine(
				(date) => date <= toISODate(new Date()),
				t("plant.errors.futureDate"),
			)
			.nullable(),
		location: z.enum(PLANT_LOCATIONS).nullable(),
		age: ageSchema.nullable(),
		light: level,
		watering: level,
		temperature: level,
		humidity: level,
		outdoor: z.boolean(),
		toxic: z.boolean(),
		floweringSeasons: z.array(z.enum(SEASONS)),
		floweringType: z.enum(FLOWERING_TYPES).nullable(),
		lifespan: z.enum(LIFESPANS).nullable(),
		notes: optionalText(
			NOTES_MAX_LENGTH,
			t("plant.errors.notesTooLong", { max: NOTES_MAX_LENGTH }),
		),
	})
	// An outdoor plant has no room, and a removed photo no credit
	.transform((plant) => ({
		...plant,
		location: plant.outdoor ? null : plant.location,
		photoCredit: plant.photo ? plant.photoCredit : null,
	}));

export type PlantFormValues = z.input<typeof plantInputSchema>;
type PlantInput = z.output<typeof plantInputSchema>;
export type Age = z.output<typeof ageSchema>;
export type AgeUnit = (typeof AGE_UNITS)[number];
export type PlantType = (typeof PLANT_TYPES)[number];
export type PlantOrigin = (typeof PLANT_ORIGINS)[number];
export type PlantLocation = (typeof PLANT_LOCATIONS)[number];
export type Season = (typeof SEASONS)[number];
export type FloweringType = (typeof FLOWERING_TYPES)[number];
export type Lifespan = (typeof LIFESPANS)[number];
export type ArchiveReason = (typeof ARCHIVE_REASONS)[number];

export type PlantData = Omit<PlantInput, "age"> & { bornAt: string | null };

export type Plant = PlantData & {
	id: string;
	createdAt: string;
	updatedAt: string;
	archivedAt: string | null;
	archiveReason: ArchiveReason | null;
};
