import { act, renderHook } from "@testing-library/react-native";
import {
	fetchTaxa,
	searchTaxa,
	type Taxon,
} from "@/features/encyclopedia/inaturalist";
import { useTaxaSearch } from "@/features/encyclopedia/useTaxaSearch";
import { SEARCH_DELAY_MS } from "@/utils/useDebouncedSearch";

jest.mock("@/features/encyclopedia/inaturalist", () => ({
	searchTaxa: jest.fn(),
	fetchTaxa: jest.fn(),
}));

jest.useFakeTimers();

const mockedSearch = searchTaxa as jest.Mock;
const mockedFetchTaxa = fetchTaxa as jest.Mock;

const photo = (id: number) => ({
	thumbnailUrl: `small-${id}`,
	largeUrl: `large-${id}`,
	attribution: "© Jane",
	pageUrl: `https://www.inaturalist.org/photos/${id}`,
});

const taxon = (id: number): Taxon => ({
	id,
	name: `Plante ${id}`,
	scientificName: `Planta ${id}`,
	family: null,
	photo: null,
	guessedType: null,
});

const settle = () =>
	act(async () => {
		jest.advanceTimersByTime(SEARCH_DELAY_MS);
	});

beforeEach(() => {
	mockedSearch.mockReset();
	mockedFetchTaxa.mockReset();
	mockedFetchTaxa.mockResolvedValue([]);
});

describe("useTaxaSearch", () => {
	it("gives the first page and the total of the search", async () => {
		mockedSearch.mockResolvedValue({ total: 2, taxa: [taxon(1), taxon(2)] });
		const { result } = await renderHook(() => useTaxaSearch("ficus"));

		await settle();

		expect(mockedSearch).toHaveBeenCalledWith("ficus", 1);
		expect(result.current).toMatchObject({
			status: "success",
			total: 2,
			hasMore: false,
		});
		expect(result.current.taxa.map(({ id }) => id)).toEqual([1, 2]);
	});

	it("loads the next pages until the total", async () => {
		mockedSearch
			.mockResolvedValueOnce({ total: 3, taxa: [taxon(1), taxon(2)] })
			.mockResolvedValueOnce({ total: 3, taxa: [taxon(3)] });
		const { result } = await renderHook(() => useTaxaSearch("ficus"));
		await settle();
		expect(result.current.hasMore).toBe(true);

		await act(async () => result.current.loadMore());

		expect(mockedSearch).toHaveBeenLastCalledWith("ficus", 2);
		expect(result.current.taxa.map(({ id }) => id)).toEqual([1, 2, 3]);
		expect(result.current.hasMore).toBe(false);

		await act(async () => result.current.loadMore());
		expect(mockedSearch).toHaveBeenCalledTimes(2);
	});

	it("starts over with a new query", async () => {
		mockedSearch
			.mockResolvedValueOnce({ total: 3, taxa: [taxon(1), taxon(2)] })
			.mockResolvedValueOnce({ total: 3, taxa: [taxon(3)] })
			.mockResolvedValueOnce({ total: 1, taxa: [taxon(9)] });
		const { result, rerender } = await renderHook(
			({ query }: { query: string }) => useTaxaSearch(query),
			{ initialProps: { query: "ficus" } },
		);
		await settle();
		await act(async () => result.current.loadMore());

		await rerender({ query: "monstera" });
		await settle();

		expect(result.current.taxa.map(({ id }) => id)).toEqual([9]);
	});

	it("keeps the loaded results when a next page fails, until a retry", async () => {
		mockedSearch
			.mockResolvedValueOnce({ total: 3, taxa: [taxon(1), taxon(2)] })
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValueOnce({ total: 3, taxa: [taxon(3)] });
		const { result } = await renderHook(() => useTaxaSearch("ficus"));
		await settle();

		await act(async () => result.current.loadMore());
		expect(result.current.taxa).toHaveLength(2);
		expect(result.current.moreFailed).toBe(true);

		// Reaching the end of the list again must not hammer the service
		await act(async () => result.current.loadMore());
		expect(mockedSearch).toHaveBeenCalledTimes(2);

		await act(async () => result.current.retryMore());
		expect(result.current.taxa.map(({ id }) => id)).toEqual([1, 2, 3]);
		expect(result.current.moreFailed).toBe(false);
	});

	it("shows a plant once when the pages overlap", async () => {
		mockedSearch
			.mockResolvedValueOnce({ total: 4, taxa: [taxon(1), taxon(2)] })
			.mockResolvedValueOnce({ total: 4, taxa: [taxon(2), taxon(3)] });
		const { result } = await renderHook(() => useTaxaSearch("ficus"));
		await settle();

		await act(async () => result.current.loadMore());

		expect(result.current.taxa.map(({ id }) => id)).toEqual([1, 2, 3]);
	});

	it("ends the list on an empty page", async () => {
		mockedSearch
			.mockResolvedValueOnce({ total: 9, taxa: [taxon(1)] })
			.mockResolvedValueOnce({ total: 9, taxa: [] });
		const { result } = await renderHook(() => useTaxaSearch("ficus"));
		await settle();

		await act(async () => result.current.loadMore());

		expect(result.current.hasMore).toBe(false);
	});
	it("starts the new list free when the query changes during a load", async () => {
		let answerOldPage: (page: unknown) => void = () => {};
		mockedSearch
			.mockResolvedValueOnce({ total: 3, taxa: [taxon(1), taxon(2)] })
			.mockImplementationOnce(
				() => new Promise((resolve) => (answerOldPage = resolve)),
			)
			.mockResolvedValueOnce({ total: 3, taxa: [taxon(7), taxon(8)] })
			.mockResolvedValueOnce({ total: 3, taxa: [taxon(9)] });
		const { result, rerender } = await renderHook(
			({ query }: { query: string }) => useTaxaSearch(query),
			{ initialProps: { query: "ficus" } },
		);
		await settle();
		// The old page stays pending while the user types another query
		await act(async () => {
			result.current.loadMore();
		});

		await rerender({ query: "monstera" });
		await settle();
		expect(result.current.loadingMore).toBe(false);

		await act(async () => result.current.loadMore());
		expect(mockedSearch).toHaveBeenLastCalledWith("monstera", 2);
		expect(result.current.taxa.map(({ id }) => id)).toEqual([7, 8, 9]);

		await act(async () => answerOldPage({ total: 3, taxa: [taxon(3)] }));
		expect(result.current.taxa.map(({ id }) => id)).toEqual([7, 8, 9]);
	});

	it("asks the next page of the query that gave the shown results", async () => {
		mockedSearch
			.mockResolvedValueOnce({ total: 3, taxa: [taxon(1), taxon(2)] })
			.mockResolvedValueOnce({ total: 3, taxa: [taxon(3)] });
		const { result, rerender } = await renderHook(
			({ query }: { query: string }) => useTaxaSearch(query),
			{ initialProps: { query: "ficus" } },
		);
		await settle();

		await rerender({ query: "ficus e" });
		await act(async () => result.current.loadMore());

		expect(mockedSearch).not.toHaveBeenCalledWith("ficus e", 2);
	});
	it("completes the photos the search did not give, in one request", async () => {
		mockedSearch.mockResolvedValue({
			total: 2,
			taxa: [{ ...taxon(1), photo: photo(1) }, taxon(2)],
		});
		mockedFetchTaxa.mockResolvedValue([{ ...taxon(2), photo: photo(2) }]);
		const { result } = await renderHook(() => useTaxaSearch("ficus"));

		await settle();

		expect(mockedFetchTaxa).toHaveBeenCalledTimes(1);
		expect(mockedFetchTaxa).toHaveBeenCalledWith([2]);
		expect(result.current.taxa.map(({ photo }) => photo)).toEqual([
			photo(1),
			photo(2),
		]);
	});

	it("keeps the results without a photo when completing them fails", async () => {
		mockedSearch.mockResolvedValue({ total: 1, taxa: [taxon(1)] });
		mockedFetchTaxa.mockRejectedValue(new Error("offline"));
		const { result } = await renderHook(() => useTaxaSearch("ficus"));

		await settle();

		expect(result.current.taxa).toEqual([taxon(1)]);
	});
});
