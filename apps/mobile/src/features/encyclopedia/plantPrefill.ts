import { curatedPlant } from "@/features/encyclopedia/curatedPlants";
import {
	isInaturalistPhoto,
	type Taxon,
} from "@/features/encyclopedia/inaturalist";
import type { PlantFormState } from "@/features/plants/plantForm";
import {
	isInaturalistPhotoPage,
	NAME_MAX_LENGTH,
	PHOTO_CREDIT_MAX_LENGTH,
	PLANT_TYPES,
	type PlantType,
	SCIENTIFIC_NAME_MAX_LENGTH,
} from "@/features/plants/plantSchema";
import { isOneOf } from "@/utils/isOneOf";

type RouteParam = string | string[] | undefined;

export type PrefillParams = {
	taxonId?: RouteParam;
	name?: RouteParam;
	scientificName?: RouteParam;
	type?: RouteParam;
	photoUrl?: RouteParam;
	photoCredit?: RouteParam;
	photoPageUrl?: RouteParam;
};

export type PlantPrefill = {
	values: Partial<PlantFormState>;
	isPartial: boolean;
};

const text = (param: RouteParam) =>
	typeof param === "string" && param.trim() ? param.trim() : undefined;

const isPlantType = (value: string | undefined): value is PlantType =>
	isOneOf(PLANT_TYPES, value);

const withoutUndefined = <T extends object>(values: T) =>
	Object.fromEntries(
		Object.entries(values).filter(([, value]) => value !== undefined),
	) as Partial<T>;

export const prefillParams = (taxon: Taxon) => ({
	taxonId: String(taxon.id),
	name: taxon.name,
	scientificName: taxon.scientificName,
	...(taxon.guessedType && { type: taxon.guessedType }),
	...(taxon.photo && {
		photoUrl: taxon.photo.largeUrl,
		photoCredit: taxon.photo.attribution,
		photoPageUrl: taxon.photo.pageUrl,
	}),
});

// The route parameters may come from a crafted link: only valid values are kept
export const plantPrefill = (params: PrefillParams): PlantPrefill | null => {
	const name = text(params.name)?.slice(0, NAME_MAX_LENGTH);
	if (!name) return null;

	const curated = curatedPlant(Number(text(params.taxonId)));
	const type = text(params.type);
	const photoUrl = isInaturalistPhoto(text(params.photoUrl))
		? text(params.photoUrl)
		: undefined;
	const attribution = text(params.photoCredit)?.slice(
		0,
		PHOTO_CREDIT_MAX_LENGTH,
	);
	const photoPageUrl = text(params.photoPageUrl);

	const known = withoutUndefined({
		name,
		scientificName: text(params.scientificName)?.slice(
			0,
			SCIENTIFIC_NAME_MAX_LENGTH,
		),
		type: isPlantType(type) ? type : undefined,
		photoUri: photoUrl,
		photoCredit:
			photoUrl && attribution && isInaturalistPhotoPage(photoPageUrl)
				? { attribution, url: photoPageUrl as string }
				: undefined,
	});

	if (!curated) return { isPartial: true, values: known };

	const { taxonId: _, ...care } = curated;
	return { isPartial: false, values: { ...known, ...care } };
};

// The user's own photo of the plant, identified by Pl@ntNet, beats the encyclopedia one
export const withIdentifiedPhoto = (
	prefill: PlantPrefill | null,
	photoUri: string | null,
): PlantPrefill | null =>
	prefill && photoUri
		? {
				...prefill,
				values: { ...prefill.values, photoUri, photoCredit: null },
			}
		: prefill;
