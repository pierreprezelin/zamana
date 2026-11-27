import {
	duplicateFormState,
	firstErrorField,
	formErrors,
	initialFormState,
	isFormSection,
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

	describe("duplicateFormState", () => {
		const source = {
			...plantInputSchema.parse(
				toFormValues({
					...initialFormState(undefined, now),
					nickname: "Gérard",
					name: "Monstera",
					origin: "cutting",
					acquiredAt: "2026-06-01",
					location: "bedroom",
					notes: "Près de la fenêtre",
					watering: 3,
				}),
			),
			id: "plant-1",
			photo: "photo.jpg",
			photoCredit: null,
			bornAt: "2026-05-18",
			createdAt: "",
			updatedAt: "",
			archivedAt: "2026-10-01T00:00:00.000Z",
			archiveReason: "given" as const,
		};

		it("clears the nickname, the identity of the plant", () => {
			expect(duplicateFormState(source, now).nickname).toBe("");
		});

		it("copies every other field, for the user to adjust", () => {
			expect(duplicateFormState(source, now)).toEqual({
				...initialFormState(source, now),
				nickname: "",
			});
			expect(duplicateFormState(source, now)).toMatchObject({
				name: "Monstera",
				origin: "cutting",
				acquiredAt: "2026-06-01",
				location: "bedroom",
				notes: "Près de la fenêtre",
				watering: 3,
				ageAmount: "5",
				photoUri: "file:///documents/plants/photo.jpg",
			});
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

describe("initialFormState with a prefill", () => {
	it("starts a new plant from the encyclopedia data", () => {
		const state = initialFormState(undefined, now, {
			name: "Cactus",
			type: "cactus",
			watering: 1,
			photoUri: "https://static.inaturalist.org/photos/1/large.jpg",
		});

		expect(state).toMatchObject({
			name: "Cactus",
			type: "cactus",
			watering: 1,
			light: 2,
			nickname: "",
			photoUri: "https://static.inaturalist.org/photos/1/large.jpg",
		});
	});
});

describe("photo credit", () => {
	it("keeps the credit of a plant photo through the form", () => {
		const photoCredit = {
			attribution: "(c) Jane",
			url: "https://www.inaturalist.org/photos/1",
		};
		const state = initialFormState(undefined, now, {
			name: "Cactus",
			photoUri: "https://static.inaturalist.org/photos/1/large.jpg",
			photoCredit,
		});

		expect(toFormValues(state).photoCredit).toEqual(photoCredit);
		expect(initialFormState(undefined, now).photoCredit).toBeNull();
	});
});

describe("isFormSection", () => {
	it("only opens a known section from a route parameter", () => {
		expect(isFormSection("needs")).toBe(true);
		expect(isFormSection("admin")).toBe(false);
		expect(isFormSection(undefined)).toBe(false);
	});
});
