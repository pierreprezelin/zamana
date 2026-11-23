import { useEffect, useState } from "react";
import {
	fetchTaxa,
	searchFirstPage,
	searchTaxa,
	type TaxaPage,
	type Taxon,
	type TaxonPhoto,
} from "@/features/encyclopedia/inaturalist";
import { useDebouncedSearch } from "@/utils/useDebouncedSearch";

type NextPages = {
	firstPage: TaxaPage | null;
	taxa: Taxon[];
	page: number;
	reachedEmptyPage: boolean;
	loading: boolean;
	failed: boolean;
};

const noNextPages = (page: TaxaPage | null): NextPages => ({
	firstPage: page,
	taxa: [],
	page: 1,
	reachedEmptyPage: false,
	loading: false,
	failed: false,
});

const LOADING = "loading";

// Search results only come with their default photo, often under a closed licence,
// while the full plant has more: fetched for the results left without one
const useCompletedPhotos = (taxa: Taxon[]) => {
	// null once answered without an open photo, so the plant is not asked again
	const [photos, setPhotos] = useState<
		Record<number, TaxonPhoto | null | typeof LOADING>
	>({});
	const missingIds = taxa
		.filter((taxon) => !taxon.photo && !(taxon.id in photos))
		.map((taxon) => taxon.id)
		.join(",");

	useEffect(() => {
		if (!missingIds) return;
		const ids = missingIds.split(",").map(Number);
		const answer = (found: Taxon[]) =>
			setPhotos((current) => ({
				...current,
				...Object.fromEntries(ids.map((id) => [id, null])),
				...Object.fromEntries(found.map((taxon) => [taxon.id, taxon.photo])),
			}));
		setPhotos((current) => ({
			...Object.fromEntries(ids.map((id) => [id, LOADING])),
			...current,
		}));
		fetchTaxa(ids)
			.then(answer)
			.catch(() => answer([]));
	}, [missingIds]);

	const photoOf = (id: number) => {
		const photo = photos[id];
		return photo === LOADING ? null : photo;
	};

	const withoutPhoto = new Set(
		taxa.filter((taxon) => !taxon.photo).map((taxon) => taxon.id),
	);

	return {
		completedTaxa: taxa.map((taxon) =>
			taxon.photo || !photoOf(taxon.id)
				? taxon
				: { ...taxon, photo: photoOf(taxon.id) },
		),
		// A result just shown, not asked yet, is loading too
		isPhotoLoading: (id: number) =>
			photos[id] === LOADING || (!(id in photos) && withoutPhoto.has(id)),
	};
};

export const useTaxaSearch = (query: string) => {
	const search = useDebouncedSearch<TaxaPage>(query, searchFirstPage);
	const [stored, setStored] = useState(noNextPages(null));
	// Pages loaded, or loading, after another first page belong to an older search
	const next =
		stored.firstPage === search.result ? stored : noNextPages(search.result);

	const taxa = [...(search.result?.taxa ?? []), ...next.taxa];
	const { completedTaxa, isPhotoLoading } = useCompletedPhotos(taxa);
	const total = search.result?.total ?? 0;
	const hasMore =
		search.status === "success" &&
		!next.reachedEmptyPage &&
		taxa.length < total;

	const fetchNextPage = async () => {
		const { resultQuery } = search;
		if (!hasMore || next.loading || !resultQuery) return;
		// An answer arriving after another search started is dropped
		const settle = (update: NextPages) =>
			setStored((current) =>
				current.firstPage === next.firstPage ? update : current,
			);
		setStored({ ...next, loading: true });
		try {
			const { taxa: more } = await searchTaxa(resultQuery, next.page + 1);
			const shown = new Set(taxa.map(({ id }) => id));
			settle({
				...next,
				taxa: [...next.taxa, ...more.filter(({ id }) => !shown.has(id))],
				page: next.page + 1,
				reachedEmptyPage: more.length === 0,
				loading: false,
				failed: false,
			});
		} catch {
			settle({ ...next, loading: false, failed: true });
		}
	};

	return {
		status: search.status,
		retry: search.retry,
		taxa: completedTaxa,
		isPhotoLoading,
		total,
		hasMore,
		loadingMore: next.loading,
		moreFailed: next.failed,
		// Reaching the end of the list again after a failure must not hammer the service
		loadMore: () => (next.failed ? undefined : fetchNextPage()),
		retryMore: fetchNextPage,
	};
};
