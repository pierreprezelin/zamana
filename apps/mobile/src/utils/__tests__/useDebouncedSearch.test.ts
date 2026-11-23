import { act, renderHook } from "@testing-library/react-native";
import {
	SEARCH_DELAY_MS,
	useDebouncedSearch,
} from "@/utils/useDebouncedSearch";

jest.useFakeTimers();

const render = async (
	search: (query: string) => Promise<string>,
	query = "fi",
) =>
	renderHook(
		({ query }: { query: string }) => useDebouncedSearch(query, search),
		{ initialProps: { query } },
	);

const wait = (ms: number) =>
	act(async () => {
		jest.advanceTimersByTime(ms);
	});

describe("useDebouncedSearch", () => {
	it("waits for 2 characters before searching", async () => {
		const search = jest.fn(() => Promise.resolve("result"));
		const { result } = await render(search, " f ");

		await wait(SEARCH_DELAY_MS);

		expect(search).not.toHaveBeenCalled();
		expect(result.current.status).toBe("idle");
	});

	it("searches once the typing pauses, with the trimmed query", async () => {
		const search = jest.fn((query: string) => Promise.resolve(query));
		const { result, rerender } = await render(search);

		await wait(SEARCH_DELAY_MS / 2);
		await rerender({ query: " fic " });
		await wait(SEARCH_DELAY_MS / 2);
		expect(search).not.toHaveBeenCalled();
		expect(result.current.status).toBe("loading");

		await wait(SEARCH_DELAY_MS);

		expect(search).toHaveBeenCalledTimes(1);
		expect(result.current).toMatchObject({ status: "success", result: "fic" });
	});

	it("ignores the answer to an outdated query", async () => {
		let answerFirst: (value: string) => void = () => {};
		const search = jest
			.fn()
			.mockImplementationOnce(
				() => new Promise<string>((resolve) => (answerFirst = resolve)),
			)
			.mockImplementationOnce(() => Promise.resolve("second"));
		const { result, rerender } = await render(search);

		await wait(SEARCH_DELAY_MS);
		await rerender({ query: "fic" });
		await wait(SEARCH_DELAY_MS);
		await act(async () => answerFirst("first"));

		expect(result.current.result).toBe("second");
	});

	it("reports a failure and searches again on retry", async () => {
		const search = jest
			.fn()
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValueOnce("result");
		const { result } = await render(search);

		await wait(SEARCH_DELAY_MS);
		expect(result.current.status).toBe("error");

		await act(async () => result.current.retry());
		await wait(SEARCH_DELAY_MS);

		expect(result.current).toMatchObject({
			status: "success",
			result: "result",
		});
	});
});
