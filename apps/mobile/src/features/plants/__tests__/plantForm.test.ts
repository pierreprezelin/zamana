import {
	firstErrorField,
	formErrors,
	initialFormState,
	toFormValues,
} from "@/features/plants/plantForm";
import { plantInputSchema } from "@/features/plants/plantSchema";

jest.mock("@/features/plants/plantPhoto", () => ({
	photoUri: (filename: string) => `file:///documents/plants/${filename}`,
}));

const now = new Date(2026, 9, 18);

const errorsOf = (overrides: Partial<ReturnType<typeof initialFormState>>) => {
	const result = plantInputSchema.safeParse(
		toFormValues({ ...initialFormState(undefined, now), ...overrides }),
	);
	return result.success ? {} : formErrors(result.error);
};

describe("plantForm", () => {
	it("starts a new plant with intermediate needs", () => {
		expect(initialFormState(undefined, now)).toMatchObject({
			name: "",
			photoUri: null,
			ageAmount: "",
			ageUnit: "year",
			light: 2,
			outdoor: false,
		});
	});

	it("prefills an existing plant", () => {
		const state = initialFormState(
			{
				...plantInputSchema.parse(
					toFormValues({ ...initialFormState(undefined, now), name: "Pothos" }),
				),
				id: "plant-1",
				photo: "photo.jpg",
				bornAt: "2026-05-18",
				createdAt: "",
				updatedAt: "",
				archivedAt: null,
				archiveReason: null,
			},
			now,
		);

		expect(state).toMatchObject({
			name: "Pothos",
			nickname: "",
			photoUri: "file:///documents/plants/photo.jpg",
			ageAmount: "5",
			ageUnit: "month",
		});
	});

	it("leaves the age empty when no amount is typed", () => {
		expect(
			toFormValues({ ...initialFormState(undefined, now), ageAmount: " " }).age,
		).toBeNull();
	});

	it("maps the errors to their fields", () => {
		expect(errorsOf({ name: "", ageAmount: "300" })).toEqual({
			name: "Le nom est obligatoire.",
			ageAmount: "L’âge doit être compris entre 1 et 100.",
		});
	});

	it("finds the first field in error from the top", () => {
		expect(firstErrorField({ notes: "x", ageAmount: "y", name: "z" })).toBe(
			"name",
		);
		expect(firstErrorField({})).toBeUndefined();
	});
});
