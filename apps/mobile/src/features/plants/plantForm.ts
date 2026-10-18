import type { z } from "zod";
import { bornAtToAge } from "@/features/plants/age";
import { photoUri } from "@/features/plants/plantPhoto";
import type {
	AgeUnit,
	Plant,
	PlantFormValues,
} from "@/features/plants/plantSchema";

export type PlantFormState = Omit<PlantFormValues, "age" | "photo"> & {
	photoUri: string | null;
	// Kept as typed text until validation
	ageAmount: string;
	ageUnit: AgeUnit;
};

export type FormField = keyof PlantFormState;

export type FormErrors = Partial<Record<FormField, string>>;

// Top to bottom, to scroll to the first field in error
export const FIELD_ORDER: FormField[] = [
	"nickname",
	"name",
	"type",
	"scientificName",
	"origin",
	"acquiredAt",
	"location",
	"ageAmount",
	"notes",
];

export const initialFormState = (
	plant: Plant | undefined,
	now: Date,
): PlantFormState => {
	const age = plant?.bornAt ? bornAtToAge(plant.bornAt, now) : null;

	return {
		photoUri: plant?.photo ? photoUri(plant.photo) : null,
		nickname: plant?.nickname ?? "",
		name: plant?.name ?? "",
		type: plant?.type ?? null,
		scientificName: plant?.scientificName ?? "",
		origin: plant?.origin ?? null,
		acquiredAt: plant?.acquiredAt ?? null,
		location: plant?.location ?? null,
		ageAmount: age ? String(age.amount) : "",
		ageUnit: age?.unit ?? "year",
		light: plant?.light ?? 2,
		watering: plant?.watering ?? 2,
		temperature: plant?.temperature ?? 2,
		humidity: plant?.humidity ?? 2,
		outdoor: plant?.outdoor ?? false,
		toxic: plant?.toxic ?? false,
		floweringSeasons: plant?.floweringSeasons ?? [],
		floweringType: plant?.floweringType ?? null,
		lifespan: plant?.lifespan ?? null,
		notes: plant?.notes ?? "",
	};
};

export const toFormValues = ({
	photoUri,
	ageAmount,
	ageUnit,
	...values
}: PlantFormState): PlantFormValues => ({
	...values,
	photo: photoUri,
	age: ageAmount.trim() ? { amount: Number(ageAmount), unit: ageUnit } : null,
});

// The first message of each field, the age errors going to its amount input
export const formErrors = (error: z.ZodError): FormErrors => {
	const errors: FormErrors = {};
	for (const issue of error.issues) {
		const [path] = issue.path;
		const field = (path === "age" ? "ageAmount" : path) as FormField;
		errors[field] ??= issue.message;
	}
	return errors;
};

export const firstErrorField = (errors: FormErrors) =>
	FIELD_ORDER.find((field) => errors[field]);

export type FormSection = "details" | "needs" | "lifecycle" | "notes";

export const SECTION_FIELDS: Record<FormSection, FormField[]> = {
	details: ["scientificName", "origin", "acquiredAt", "location", "ageAmount"],
	needs: [],
	lifecycle: [],
	notes: ["notes"],
};
