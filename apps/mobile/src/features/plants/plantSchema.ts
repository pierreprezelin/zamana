import { z } from "zod";
import { toISODate } from "@/utils/dates";

export const NICKNAME_MAX_LENGTH = 20;
export const NAME_MAX_LENGTH = 50;
export const SCIENTIFIC_NAME_MAX_LENGTH = 50;
export const NOTES_MAX_LENGTH = 500;
export const AGE_MAX = 100;

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
export const ARCHIVE_REASONS = [
	"dead",
	"given",
	"sold",
	"lost",
	"other",
] as const;

const optionalText = (max: number, label: string) =>
	z
		.string()
		.trim()
		.max(max, `${label} ne peut pas dépasser ${max} caractères.`)
		.transform((text) => text || null);

const level = z.int().min(1).max(3);

export const ageSchema = z.object({
	amount: z
		.number()
		.int("L’âge doit être un nombre entier.")
		.min(1, `L’âge doit être compris entre 1 et ${AGE_MAX}.`)
		.max(AGE_MAX, `L’âge doit être compris entre 1 et ${AGE_MAX}.`),
	unit: z.enum(AGE_UNITS),
});

export const plantInputSchema = z
	.object({
		photo: z.string().nullable(),
		nickname: optionalText(NICKNAME_MAX_LENGTH, "Le surnom"),
		name: z
			.string()
			.trim()
			.min(1, "Le nom est obligatoire.")
			.max(
				NAME_MAX_LENGTH,
				`Le nom ne peut pas dépasser ${NAME_MAX_LENGTH} caractères.`,
			),
		type: z.enum(PLANT_TYPES).nullable(),
		scientificName: optionalText(
			SCIENTIFIC_NAME_MAX_LENGTH,
			"Le nom scientifique",
		),
		origin: z.enum(PLANT_ORIGINS).nullable(),
		acquiredAt: z.iso
			.date()
			.refine(
				(date) => date <= toISODate(new Date()),
				"La date ne peut pas être dans le futur.",
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
		notes: optionalText(NOTES_MAX_LENGTH, "La note"),
	})
	// An outdoor plant has no room
	.transform((plant) => (plant.outdoor ? { ...plant, location: null } : plant));

export type PlantFormValues = z.input<typeof plantInputSchema>;
export type PlantInput = z.output<typeof plantInputSchema>;
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
