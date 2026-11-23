import {
	countPlants,
	fetchTaxa,
	fetchTaxon,
	guessPlantType,
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
	id: 126507,
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
	});

	it("names each plant by its common name, capitalized, with its free photo", async () => {
		respond({ total_results: 583, results: [rubberPlant] });

		expect(await searchTaxa("ficus", 1)).toEqual({
			total: 583,
			taxa: [
				{
					id: 126507,
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

		expect(taxa[0].name).toBe("Ficus elastica");
		expect(taxa[0].photo).toBeNull();
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

			expect(taxa[0].photo).toBeNull();
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

			expect(taxa[0].photo).not.toBeNull();
		},
	);

	it("falls back on the photo picked for a curated plant without an open one", async () => {
		const sansevieria = 67710;
		respond({
			total_results: 1,
			results: [
				{ ...rubberPlant, id: sansevieria, default_photo: reservedPhoto },
			],
		});

		const { taxa } = await searchTaxa("sansevieria", 1);

		expect(taxa[0].photo).toEqual({
			thumbnailUrl:
				"https://inaturalist-open-data.s3.amazonaws.com/photos/698006029/small.jpg",
			largeUrl:
				"https://inaturalist-open-data.s3.amazonaws.com/photos/698006029/large.jpg",
			attribution: "© zebedeugalinha, some rights reserved (CC BY)",
			pageUrl: "https://www.inaturalist.org/photos/698006029",
		});
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

		expect(taxa[0].photo).toBeNull();
	});

	it("guesses the type of a cactus from its ancestors", async () => {
		respond({
			total_results: 1,
			results: [{ ...rubberPlant, ancestor_ids: [47126, 47903, 1] }],
		});

		const { taxa } = await searchTaxa("cactus", 1);

		expect(taxa[0].guessedType).toBe("cactus");
	});

	it("skips a malformed result", async () => {
		respond({ total_results: 2, results: [{ id: "oops" }, rubberPlant] });

		const { taxa } = await searchTaxa("ficus", 1);

		expect(taxa.map((taxon) => taxon.id)).toEqual([126507]);
	});

	it("gives up on a service that does not answer", async () => {
		respond({ total_results: 0, results: [] });
		await searchTaxa("ficus", 1);
		const [, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
		expect(options.signal).toBeInstanceOf(AbortSignal);
	});

	it("fails when the service does", async () => {
		respond({}, false);
		await expect(searchTaxa("ficus", 1)).rejects.toThrow();
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

		expect(requestedUrl().pathname).toBe("/v1/taxa/1,2");
		expect(requestedUrl().searchParams.get("locale")).toBe("fr");
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

		const taxon = await fetchTaxon(126507);

		expect(requestedUrl().pathname).toBe("/v1/taxa/126507");
		expect(taxon?.family).toBe("Moraceae");
		expect(taxon?.photo?.attribution).toBe(
			"© Jane, some rights reserved (CC BY)",
		);
	});

	it("finds nothing for a taxon that is not a plant", async () => {
		respond({ results: [{ ...rubberPlant, ancestor_ids: [48460, 1] }] });
		expect(await fetchTaxon(126507)).toBeNull();
	});

	it("finds nothing for an unknown plant", async () => {
		respond({ results: [] });
		expect(await fetchTaxon(1)).toBeNull();
	});
});

describe("guessPlantType", () => {
	it.each([
		[47903, "cactus"],
		[47217, "orchid"],
		[48867, "palm"],
		[121943, "fern"],
		[54297, "citrus"],
		[51890, "succulent"],
		[49320, "succulent"],
		[51937, "carnivorous"],
		[52649, "carnivorous"],
		[52647, "carnivorous"],
		[57860, "carnivorous"],
	])("recognizes the ancestor %i as %s", (ancestorId, type) => {
		expect(guessPlantType([47126, ancestorId, 999])).toBe(type);
	});

	it("guesses nothing for other plants", () => {
		expect(guessPlantType([47126, 50998])).toBeNull();
	});
});
