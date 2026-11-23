import { useEffect, useState } from "react";
import {
	fetchTaxa,
	searchTaxa,
	type TaxaPage,
	type Taxon,
	type TaxonPhoto,
} from "@/features/encyclopedia/inaturalist";
import { useDebouncedSearch } from "@/utils/useDebouncedSearch";

const firstPage = (query: string) => searchTaxa(query, 1);

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

// Search results only come with their default photo, often under a closed licence,
// while the full plant has more: fetched for the results left without one
const useCompletedPhotos = (taxa: Taxon[]) => {
	// null once asked, so a plant without any open photo is not asked again
	const [photos, setPhotos] = useState<Record<number, TaxonPhoto | null>>({});
	const missingIds = taxa
		.filter((taxon) => !taxon.photo && !(taxon.id in photos))
		.map((taxon) => taxon.id)
		.join(",");

	useEffect(() => {
		if (!missingIds) return;
		const ids = missingIds.split(",").map(Number);
		const asked = Object.fromEntries(ids.map((id) => [id, null]));
		setPhotos((current) => ({ ...asked, ...current }));
		fetchTaxa(ids)
			.then((found) =>
				setPhotos((current) => ({
					...current,
					...Object.fromEntries(found.map((taxon) => [taxon.id, taxon.photo])),
				})),
			)
			.catch(() => {});
	}, [missingIds]);

	return taxa.map((taxon) =>
		taxon.photo || !photos[taxon.id]
			? taxon
			: { ...taxon, photo: photos[taxon.id] },
	);
};

export const useTaxaSearch = (query: string) => {
	const search = useDebouncedSearch<TaxaPage>(query, firstPage);
	const [stored, setStored] = useState(noNextPages(null));
	// Pages loaded, or loading, after another first page belong to an older search
	const next =
		stored.firstPage === search.result ? stored : noNextPages(search.result);

	const taxa = [...(search.result?.taxa ?? []), ...next.taxa];
	const completedTaxa = useCompletedPhotos(taxa);
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
		total,
		hasMore,
		loadingMore: next.loading,
		moreFailed: next.failed,
		// Reaching the end of the list again after a failure must not hammer the service
		loadMore: () => (next.failed ? undefined : fetchNextPage()),
		retryMore: fetchNextPage,
	};
};
