import {
	identifiedPhotoFor,
	isIdentifiedQuery,
	useIdentifiedPhotoStore,
} from "@/features/identification/useIdentifiedPhotoStore";

const suggestions = [
	{ scientificName: "Monstera deliciosa", commonName: null, score: 0.87 },
	{
		scientificName: "Philodendron bipinnatifidum",
		commonName: null,
		score: 0.05,
	},
];

describe("isIdentifiedQuery", () => {
	it("is identified while the search is one of the suggestions", () => {
		expect(
			isIdentifiedQuery(" Philodendron bipinnatifidum ", suggestions),
		).toBe(true);
	});

	it("is no longer identified once the user searches something else", () => {
		expect(isIdentifiedQuery("Monstera", suggestions)).toBe(false);
	});
});

describe("useIdentifiedPhotoStore", () => {
	it("keeps the identified photo with its suggestions until cleared", () => {
		const { suggestions: none } = useIdentifiedPhotoStore.getState();
		useIdentifiedPhotoStore
			.getState()
			.identify("file:///cache/mine.jpg", suggestions);

		expect(useIdentifiedPhotoStore.getState()).toMatchObject({
			photoUri: "file:///cache/mine.jpg",
			suggestions,
		});

		useIdentifiedPhotoStore.getState().clear();

		// The same empty array: readers of a cleared store do not render again
		expect(useIdentifiedPhotoStore.getState()).toMatchObject({
			photoUri: null,
		});
		expect(useIdentifiedPhotoStore.getState().suggestions).toBe(none);
	});
});

describe("identifiedPhotoFor", () => {
	const identified = { photoUri: "file:///cache/mine.jpg", suggestions };

	it("gives the photo to a suggested species", () => {
		expect(identifiedPhotoFor("Monstera deliciosa", identified)).toBe(
			"file:///cache/mine.jpg",
		);
	});

	it("keeps it from another species of the results, or from a link", () => {
		expect(identifiedPhotoFor("Monstera adansonii", identified)).toBeNull();
		expect(identifiedPhotoFor(undefined, identified)).toBeNull();
	});
});
