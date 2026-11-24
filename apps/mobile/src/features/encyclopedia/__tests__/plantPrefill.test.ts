import { CURATED_PLANTS } from "@/features/encyclopedia/curatedPlants";
import {
	plantPrefill,
	prefillParams,
} from "@/features/encyclopedia/plantPrefill";
import {
	NAME_MAX_LENGTH,
	SCIENTIFIC_NAME_MAX_LENGTH,
} from "@/features/plants/plantSchema";

const photoUrl =
	"https://inaturalist-open-data.s3.amazonaws.com/photos/1/large.jpg";

describe("plantPrefill", () => {
	it("prefills everything known about a curated plant", () => {
		const [curated] = CURATED_PLANTS;
		if (!curated) throw new Error("No curated plant");
		const { taxonId, ...care } = curated;

		const prefill = plantPrefill({
			taxonId: String(taxonId),
			name: "Monstera",
			scientificName: "Monstera deliciosa",
			type: "cactus",
			photoUrl,
		});

		expect(prefill).toEqual({
			isPartial: false,
			values: {
				...care,
				name: "Monstera",
				scientificName: "Monstera deliciosa",
				photoUri: photoUrl,
			},
		});
	});

	it("prefills the names, photo and guessed type of another plant", () => {
		expect(
			plantPrefill({
				taxonId: "999999999",
				name: "Cierge",
				scientificName: "Cereus jamacaru",
				type: "cactus",
				photoUrl,
			}),
		).toEqual({
			isPartial: true,
			values: {
				name: "Cierge",
				scientificName: "Cereus jamacaru",
				type: "cactus",
				photoUri: photoUrl,
			},
		});
	});

	it("ignores what a crafted link could slip in", () => {
		const prefill = plantPrefill({
			taxonId: "1.5",
			name: "Cierge",
			type: "rocket",
			photoUrl: "https://evil.example.com/photo.jpg",
		});

		expect(prefill).toEqual({ isPartial: true, values: { name: "Cierge" } });
	});

	it("only accepts photos served over https by iNaturalist", () => {
		const photoOf = (url: string) =>
			plantPrefill({ name: "Cierge", photoUrl: url })?.values.photoUri;

		expect(photoOf("http://static.inaturalist.org/photos/1/large.jpg")).toBe(
			undefined,
		);
		expect(photoOf("https://static.inaturalist.org/photos/1/large.jpg")).toBe(
			"https://static.inaturalist.org/photos/1/large.jpg",
		);
		expect(
			photoOf("https://static.inaturalist.org.evil.com/photos/1/large.jpg"),
		).toBe(undefined);
	});

	it("only credits a photo with a link to its iNaturalist page", () => {
		const creditOf = (photoPageUrl: string, url = photoUrl) =>
			plantPrefill({
				name: "Cierge",
				photoUrl: url,
				photoCredit: "(c) Jane",
				photoPageUrl,
			})?.values.photoCredit;

		expect(creditOf("https://www.inaturalist.org/photos/42")).toEqual({
			attribution: "(c) Jane",
			url: "https://www.inaturalist.org/photos/42",
		});
		expect(creditOf("https://evil.example.com/photos/42")).toBeUndefined();
		expect(creditOf("https://www.inaturalist.org/login")).toBeUndefined();
		expect(
			creditOf(
				"https://www.inaturalist.org/photos/42",
				"https://evil.com/a.jpg",
			),
		).toBeUndefined();
	});

	it("cuts the names to what the form accepts", () => {
		const prefill = plantPrefill({
			name: "a".repeat(NAME_MAX_LENGTH + 10),
			scientificName: "b".repeat(SCIENTIFIC_NAME_MAX_LENGTH + 10),
		});

		expect(prefill?.values.name).toHaveLength(NAME_MAX_LENGTH);
		expect(prefill?.values.scientificName).toHaveLength(
			SCIENTIFIC_NAME_MAX_LENGTH,
		);
	});

	it("prefills nothing when opened without a plant", () => {
		expect(plantPrefill({})).toBeNull();
		expect(plantPrefill({ name: ["a", "b"] })).toBeNull();
	});

	it("prefills the form from an encyclopedia plant", () => {
		const params = prefillParams({
			id: 999999999,
			name: "Cierge",
			scientificName: "Cereus jamacaru",
			family: "Cactaceae",
			guessedType: "cactus",
			photo: {
				thumbnailUrl: "small",
				largeUrl: photoUrl,
				attribution: "(c) Jane",
				pageUrl: "https://www.inaturalist.org/photos/1",
			},
		});

		expect(plantPrefill(params)?.values).toEqual({
			name: "Cierge",
			scientificName: "Cereus jamacaru",
			type: "cactus",
			photoUri: photoUrl,
			photoCredit: {
				attribution: "(c) Jane",
				url: "https://www.inaturalist.org/photos/1",
			},
		});
	});
});
