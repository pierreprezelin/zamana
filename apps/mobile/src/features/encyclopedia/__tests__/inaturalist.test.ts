import i18next from "i18next";
import { pickedPhoto } from "@/features/encyclopedia/curatedPlants";
import {
	countPlants,
	fetchTaxa,
	fetchTaxon,
	guessPlantType,
	isInaturalistPhoto,
	searchFirstPage,
	searchTaxa,
} from "@/features/encyclopedia/inaturalist";

const respond = (body: unknown, ok = true) => {
	globalThis.fetch = jest.fn(() =>
		Promise.resolve({ ok, json: () => Promise.resolve(body) }),
	) as jest.Mock;
};

const requestedUrl = () =>
	new URL((globalThis.fetch as jest.Mock).mock.calls[0][0] as string);

const freePhoto = {
	license_code: "cc-by",
	medium_url:
		"https://inaturalist-open-data.s3.amazonaws.com/photos/1/medium.jpg",
	attribution: "(c) Jane, some rights reserved (CC BY)",
};
const reservedPhoto = {
	license_code: null,
	medium_url: "https://static.inaturalist.org/photos/2/medium.jpeg",
	attribution: "(c) John, all rights reserved",
};

const rubberPlant = {
	id: 53940,
	name: "Ficus elastica",
	preferred_common_name: "caoutchouc",
	ancestor_ids: [48460, 47126, 50998],
	default_photo: freePhoto,
};

describe("searchTaxa", () => {
	it("searches the plants by their names in the app language", async () => {
		respond({ total_results: 0, results: [] });

		await searchTaxa("caoutchouc", 2);

		const params = requestedUrl().searchParams;
		expect(params.get("q")).toBe("caoutchouc");
		expect(params.get("taxon_id")).toBe("47126");
		expect(params.get("locale")).toBe("fr");
		expect(params.get("is_active")).toBe("true");
		expect(params.get("rank")).toBe("species,hybrid,variety,form");
		expect(params.get("page")).toBe("2");
		expect(params.get("per_page")).toBe("20");
		expect(params.get("fields")).toContain("default_photo");
	});

	it("names each plant by its common name, capitalized, with its free photo", async () => {
		respond({ total_results: 583, results: [rubberPlant] });

		expect(await searchTaxa("ficus", 1)).toEqual({
			total: 583,
			taxa: [
				{
					id: 53940,
					name: "Caoutchouc",
					scientificName: "Ficus elastica",
					family: null,
					guessedType: null,
					photo: {
						thumbnailUrl:
							"https://inaturalist-open-data.s3.amazonaws.com/photos/1/small.jpg",
						largeUrl:
							"https://inaturalist-open-data.s3.amazonaws.com/photos/1/large.jpg",
						attribution: "© Jane, some rights reserved (CC BY)",
						pageUrl: "https://www.inaturalist.org/photos/1",
					},
				},
			],
		});
	});

	it("falls back on the scientific name and drops a photo without a free licence", async () => {
		respond({
			total_results: 1,
			results: [
				{
					...rubberPlant,
					preferred_common_name: undefined,
					default_photo: reservedPhoto,
				},
			],
		});

		const { taxa } = await searchTaxa("ficus", 1);

		expect(taxa[0]?.name).toBe("Ficus elastica");
		expect(taxa[0]?.photo).toBeNull();
	});

	it.each(["cc-by-nc", "cc-by-nd", "cc-by-nc-sa", "cc-by-nc-nd"])(
		"drops a %s photo, which forbids some uses of the app",
		async (license_code) => {
			respond({
				total_results: 1,
				results: [
					{ ...rubberPlant, default_photo: { ...freePhoto, license_code } },
				],
			});

			const { taxa } = await searchTaxa("ficus", 1);

			expect(taxa[0]?.photo).toBeNull();
		},
	);

	it.each(["cc0", "pd", "cc-by", "cc-by-sa"])(
		"keeps a %s photo",
		async (license_code) => {
			respond({
				total_results: 1,
				results: [
					{ ...rubberPlant, default_photo: { ...freePhoto, license_code } },
				],
			});

			const { taxa } = await searchTaxa("ficus", 1);

			expect(taxa[0]?.photo).toBeTruthy();
		},
	);

	it("shows the indoor photo picked for a curated plant, even over an open one", async () => {
		const sansevieria = 67710;
		respond({
			total_results: 1,
			results: [{ ...rubberPlant, id: sansevieria, default_photo: freePhoto }],
		});

		const { taxa } = await searchTaxa("sansevieria", 1);

		expect(taxa[0]?.photo?.largeUrl).toBe(
			pickedPhoto(sansevieria)?.url.replace("/medium.", "/large."),
		);
	});

	it("only shows photos served over https by iNaturalist", async () => {
		respond({
			total_results: 2,
			results: [
				{
					...rubberPlant,
					default_photo: {
						...freePhoto,
						medium_url: "http://evil.example.com/photos/1/medium.jpg",
					},
				},
			],
		});

		const { taxa } = await searchTaxa("ficus", 1);

		expect(taxa[0]?.photo).toBeNull();
	});

	it("guesses the type of a cactus from its ancestors", async () => {
		respond({
			total_results: 1,
			results: [{ ...rubberPlant, ancestor_ids: [47126, 47903, 1] }],
		});

		const { taxa } = await searchTaxa("cactus", 1);

		expect(taxa[0]?.guessedType).toBe("cactus");
	});

	it("skips a malformed result", async () => {
		respond({ total_results: 2, results: [{ id: "oops" }, rubberPlant] });

		const { taxa } = await searchTaxa("ficus", 1);

		expect(taxa.map((taxon) => taxon.id)).toEqual([53940]);
	});

	it("fails when the service does", async () => {
		respond({}, false);
		await expect(searchTaxa("ficus", 1)).rejects.toThrow();
	});

	it("fails on a malformed answer, rather than caching an empty page", async () => {
		respond({ total_results: 3 });
		await expect(searchTaxa("ficus", 1)).rejects.toThrow();
	});
});

describe("isInaturalistPhoto", () => {
	it.each([
		["https://static.inaturalist.org/photos/1/medium.jpg", true],
		[
			"https://inaturalist-open-data.s3.amazonaws.com/photos/2/medium.jpeg",
			true,
		],
		["http://static.inaturalist.org/photos/1/medium.jpg", false],
		["https://evil.example/photos/1/medium.jpg", false],
		["https://static.inaturalist.org/avatars/1/medium.jpg", false],
		["https://static.inaturalist.org/photos/x/medium.jpg", false],
		["not a url", false],
		[undefined, false],
	])("%s → %s", (url, expected) => {
		expect(isInaturalistPhoto(url)).toBe(expected);
	});
});

describe("countPlants", () => {
	it("counts the active plant species", async () => {
		respond({ total_results: 307265, results: [] });

		expect(await countPlants()).toBe(307265);
		const params = requestedUrl().searchParams;
		expect(params.get("taxon_id")).toBe("47126");
		expect(params.get("rank")).toBe("species,hybrid,variety,form");
		expect(params.has("q")).toBe(false);
	});
});

describe("fetchTaxa", () => {
	it("fetches several plants in one request, keeping the asked order", async () => {
		respond({
			results: [
				{ ...rubberPlant, id: 2 },
				{ ...rubberPlant, id: 1 },
			],
		});

		const taxa = await fetchTaxa([1, 2]);

		expect(requestedUrl().pathname).toBe("/v2/taxa/1,2");
		expect(requestedUrl().searchParams.get("locale")).toBe("fr");
		expect(requestedUrl().searchParams.get("fields")).toContain("taxon_photos");
		expect(taxa.map((taxon) => taxon.id)).toEqual([1, 2]);
	});

	it("refuses more ids than the service accepts", async () => {
		await expect(
			fetchTaxa(Array.from({ length: 31 }, (_, index) => index + 1)),
		).rejects.toThrow();
	});

	it("needs no request without ids", async () => {
		globalThis.fetch = jest.fn();
		expect(await fetchTaxa([])).toEqual([]);
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});
});

describe("fetchTaxon", () => {
	it("names the family and picks the first free photo", async () => {
		respond({
			results: [
				{
					...rubberPlant,
					default_photo: reservedPhoto,
					ancestors: [
						{ id: 47126, rank: "kingdom", name: "Plantae" },
						{ id: 50998, rank: "family", name: "Moraceae" },
					],
					taxon_photos: [{ photo: reservedPhoto }, { photo: freePhoto }],
				},
			],
		});

		const taxon = await fetchTaxon(53940);

		expect(requestedUrl().pathname).toBe("/v2/taxa/53940");
		expect(taxon?.family).toBe("Moraceae");
		expect(taxon?.photo?.attribution).toBe(
			"© Jane, some rights reserved (CC BY)",
		);
	});

	it("finds nothing for a taxon that is not a plant", async () => {
		respond({ results: [{ ...rubberPlant, ancestor_ids: [48460, 1] }] });
		expect(await fetchTaxon(53940)).toBeNull();
	});

	it("finds nothing for an unknown plant", async () => {
		respond({ results: [] });
		expect(await fetchTaxon(1)).toBeNull();
	});
});

describe("guessPlantType", () => {
	it("recognizes a plant by its ancestors, the first recognized one first", () => {
		expect(guessPlantType([47126, 47903, 999])).toBe("cactus");
		expect(guessPlantType([47126, 47217, 47903])).toBe("orchid");
	});

	it("guesses nothing for other plants", () => {
		expect(guessPlantType([47126, 50998])).toBeNull();
	});
});

describe("usage names", () => {
	afterEach(() => i18next.changeLanguage("fr"));

	const snakePlant = {
		...rubberPlant,
		id: 67710,
		name: "Sansevieria trifasciata",
		preferred_common_name: "sansevière",
	};

	it("names a curated plant as it is known, in the app language", async () => {
		respond({ total_results: 1, results: [snakePlant] });
		expect((await searchTaxa("sansevieria", 1)).taxa[0]?.name).toBe(
			"Langue de belle-mère",
		);

		await i18next.changeLanguage("en");
		respond({ total_results: 1, results: [snakePlant] });
		expect((await searchTaxa("sansevieria", 1)).taxa[0]?.name).toBe(
			"Snake plant",
		);
	});

	it("gives a curated plant its curated type, however it is reached", async () => {
		respond({ total_results: 1, results: [{ ...rubberPlant, id: 69223 }] });
		expect((await searchTaxa("pothos", 1)).taxa[0]?.guessedType).toBe(
			"climber",
		);
	});
});

describe("searchFirstPage", () => {
	const pothosId = 69223;

	it("shows the curated plants known by that name before iNaturalist's", async () => {
		respond({ total_results: 1, results: [rubberPlant] });

		const { taxa, total } = await searchFirstPage("epipremnum");

		expect(taxa.map((taxon) => taxon.id)).toEqual([pothosId, rubberPlant.id]);
		expect(taxa[0]).toMatchObject({
			name: "Pothos",
			scientificName: "Epipremnum aureum",
			guessedType: "climber",
		});
		expect(taxa[0]?.photo).toBeTruthy();
		// The curated plant missing from the iNaturalist results counts too
		expect(total).toBe(2);
	});

	it("tells the nickname a curated plant was found by", async () => {
		respond({ total_results: 0, results: [] });

		const { taxa } = await searchFirstPage("fleur de");

		expect(taxa[0]).toMatchObject({
			name: "Spathiphyllum",
			matchedAlias: "fleur de lune",
		});
	});

	it("tells no nickname when the shown names match", async () => {
		respond({ total_results: 0, results: [] });

		const { taxa } = await searchFirstPage("epipremnum");

		expect(taxa[0]?.matchedAlias).toBeUndefined();
	});

	it("drops the iNaturalist copy of a curated plant shown first", async () => {
		respond({
			total_results: 2,
			results: [{ ...rubberPlant, id: pothosId }, rubberPlant],
		});

		const page = await searchFirstPage("epipremnum");

		expect(page.taxa.map((taxon) => taxon.id)).toEqual([
			pothosId,
			rubberPlant.id,
		]);
		expect(page.total).toBe(2);
	});

	it("still shows the curated plants when iNaturalist cannot be reached", async () => {
		respond({}, false);

		const page = await searchFirstPage("epipremnum");

		expect(page.taxa.map((taxon) => taxon.id)).toEqual([pothosId]);
		expect(page.total).toBe(1);
	});

	it("fails like iNaturalist when no curated plant is known by that name", async () => {
		respond({}, false);

		await expect(searchFirstPage("baobab")).rejects.toThrow();
	});
});
