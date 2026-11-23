import { nativeApplicationVersion } from "expo-application";
import { z } from "zod";
import {
	type CuratedPlant,
	curatedPlant,
	pickedPhoto,
	searchCuratedPlants,
	usageName,
} from "@/features/encyclopedia/curatedPlants";
import type { PlantType } from "@/features/plants/plantSchema";
import { getJson } from "@/utils/getJson";
import { locale } from "@/utils/i18n";

const TAXA_URL = "https://api.inaturalist.org/v2/taxa";
const PHOTO_FIELDS = "(license_code:!t,medium_url:!t,attribution:!t)";
// Only what the app reads: a full plant weighs about 50 KB, these fields 3 KB.
// The search ignores taxon_photos and ancestors, sent by the full plant only
const FIELDS = `(id:!t,name:!t,preferred_common_name:!t,ancestor_ids:!t,default_photo:${PHOTO_FIELDS},taxon_photos:(photo:${PHOTO_FIELDS}),ancestors:(rank:!t,name:!t))`;
const PLANTAE_ID = "47126";
// What a gardener adds, without the genera and families
const RANKS = "species,hybrid,variety,form";
export const SEARCH_PAGE_SIZE = 20;
const MAX_IDS_PER_REQUEST = 30;

const HEADERS = { "User-Agent": `Zamana/${nativeApplicationVersion ?? "dev"}` };

// A cactus or an orchid is recognized by its family, for a plant outside the curated list
const TYPE_BY_ANCESTOR: Record<number, PlantType> = {
	47903: "cactus", // Cactaceae
	47217: "orchid", // Orchidaceae
	48867: "palm", // Arecaceae
	121943: "fern", // Polypodiopsida
	54297: "citrus", // Citrus
	51890: "succulent", // Crassulaceae
	49320: "succulent", // Aizoaceae
	51937: "carnivorous", // Droseraceae
	52649: "carnivorous", // Sarraceniaceae
	52647: "carnivorous", // Nepenthaceae
	57860: "carnivorous", // Lentibulariaceae
};

export const guessPlantType = (ancestorIds: number[]) =>
	ancestorIds.map((id) => TYPE_BY_ANCESTOR[id]).find(Boolean) ?? null;

const photoSchema = z.object({
	license_code: z.string().nullish(),
	medium_url: z.string(),
	attribution: z.string(),
});

const taxonSchema = z.object({
	id: z.number(),
	name: z.string(),
	preferred_common_name: z.string().nullish(),
	ancestor_ids: z.array(z.number()).default([]),
	ancestors: z
		.array(z.object({ rank: z.string(), name: z.string() }))
		.optional(),
	default_photo: photoSchema.nullish(),
	taxon_photos: z.array(z.object({ photo: photoSchema })).optional(),
});

export type TaxonPhoto = {
	thumbnailUrl: string;
	largeUrl: string;
	attribution: string;
	pageUrl: string;
};

const PHOTO_HOSTS = [
	"inaturalist-open-data.s3.amazonaws.com",
	"static.inaturalist.org",
];

export const isInaturalistPhoto = (url: string | undefined) => {
	if (!url) return false;
	try {
		const { protocol, hostname, pathname } = new URL(url);
		return (
			protocol === "https:" &&
			PHOTO_HOSTS.includes(hostname) &&
			/^\/photos\/\d+\//.test(pathname)
		);
	} catch {
		return false;
	}
};

export type Taxon = {
	id: number;
	name: string;
	scientificName: string;
	family: string | null;
	photo: TaxonPhoto | null;
	guessedType: PlantType | null;
};

export type TaxaPage = { total: number; taxa: Taxon[] };

const upperFirst = (text: string) =>
	`${text.charAt(0).toLocaleUpperCase(locale())}${text.slice(1)}`;

// The licences allowing any use, commercial and cropped included, as long as the author is credited
const OPEN_LICENSES = ["cc0", "pd", "cc-by", "cc-by-sa"];

const toTaxonPhoto = (mediumUrl: string, attribution: string): TaxonPhoto => ({
	thumbnailUrl: mediumUrl.replace("/medium.", "/small."),
	largeUrl: mediumUrl.replace("/medium.", "/large."),
	attribution: attribution.replace(/^\(c\)/i, "©"),
	pageUrl: `https://www.inaturalist.org/photos/${new URL(mediumUrl).pathname.split("/")[2]}`,
});

const freePhoto = (
	photos: (z.infer<typeof photoSchema> | null | undefined)[],
): TaxonPhoto | null => {
	const photo = photos.find(
		(candidate) =>
			OPEN_LICENSES.includes(candidate?.license_code ?? "") &&
			isInaturalistPhoto(candidate?.medium_url),
	);
	return photo ? toTaxonPhoto(photo.medium_url, photo.attribution) : null;
};

const pickedTaxonPhoto = (taxonId: number) => {
	const photo = pickedPhoto(taxonId);
	return photo ? toTaxonPhoto(photo.url, photo.attribution) : null;
};

// A curated plant goes by the name people use, like "Monstera" rather than "Faux philodendron"
const commonName = (id: number, inaturalistName: string | null | undefined) => {
	const plant = curatedPlant(id);
	if (plant) return usageName(plant);
	return inaturalistName ? upperFirst(inaturalistName) : null;
};

const toTaxon = (result: unknown): Taxon[] => {
	const parsed = taxonSchema.safeParse(result);
	if (!parsed.success) return [];
	const taxon = parsed.data;
	// A link to the detail screen may name any living being: only plants go to a garden
	if (!taxon.ancestor_ids.includes(Number(PLANTAE_ID))) return [];
	return [
		{
			id: taxon.id,
			name: commonName(taxon.id, taxon.preferred_common_name) ?? taxon.name,
			scientificName: taxon.name,
			family:
				taxon.ancestors?.find((ancestor) => ancestor.rank === "family")?.name ??
				null,
			// A curated plant shows an indoor photo, as it grows at home, rather than in the wild
			photo:
				pickedTaxonPhoto(taxon.id) ??
				freePhoto([
					taxon.default_photo,
					...(taxon.taxon_photos ?? []).map(({ photo }) => photo),
				]),
			guessedType:
				curatedPlant(taxon.id)?.type ?? guessPlantType(taxon.ancestor_ids),
		},
	];
};

const getTaxa = async (url: string, params: Record<string, string> = {}) => {
	const response = (await getJson(
		url,
		{ ...params, locale: locale(), fields: FIELDS },
		HEADERS,
	)) as { total_results?: unknown; results?: unknown };
	const results = Array.isArray(response?.results) ? response.results : [];
	return {
		total:
			typeof response?.total_results === "number" ? response.total_results : 0,
		taxa: results.flatMap(toTaxon),
	};
};

const plantsQuery = {
	taxon_id: PLANTAE_ID,
	is_active: "true",
	rank: RANKS,
};

export const searchTaxa = (query: string, page: number): Promise<TaxaPage> =>
	getTaxa(TAXA_URL, {
		...plantsQuery,
		q: query,
		page: String(page),
		per_page: String(SEARCH_PAGE_SIZE),
	});

// Built from the curated data alone: the family comes with the detail screen
const curatedTaxon = (plant: CuratedPlant): Taxon => ({
	id: plant.taxonId,
	name: usageName(plant),
	scientificName: plant.scientificName,
	family: null,
	photo: pickedTaxonPhoto(plant.taxonId),
	guessedType: plant.type,
});

// The curated plants known by that name come first, then iNaturalist's; offline, they show alone.
// ponytail: one found again on a later iNaturalist page is counted twice in the total, and the
// list then only ends on an empty page: one request more
export const searchFirstPage = async (query: string): Promise<TaxaPage> => {
	const curated = searchCuratedPlants(query).map(curatedTaxon);
	const page = await searchTaxa(query, 1).catch((error: unknown) => {
		if (curated.length === 0) throw error;
		return { total: 0, taxa: [] };
	});
	const curatedIds = new Set(curated.map((taxon) => taxon.id));
	const others = page.taxa.filter((taxon) => !curatedIds.has(taxon.id));
	return {
		total: page.total + curated.length - (page.taxa.length - others.length),
		taxa: [...curated, ...others],
	};
};

// A page of 0 results is ignored by the service: 1 is the lightest
export const countPlants = async () =>
	(await getTaxa(TAXA_URL, { ...plantsQuery, per_page: "1" })).total;

export const fetchTaxa = async (ids: number[]) => {
	if (ids.length === 0) return [];
	if (ids.length > MAX_IDS_PER_REQUEST) {
		throw new Error(`At most ${MAX_IDS_PER_REQUEST} taxa per request`);
	}
	const { taxa } = await getTaxa(`${TAXA_URL}/${ids.join(",")}`);
	return ids.flatMap((id) => taxa.filter((taxon) => taxon.id === id));
};

export const fetchTaxon = async (id: number) =>
	(await fetchTaxa([id]))[0] ?? null;
