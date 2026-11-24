import { act, renderHook } from "@testing-library/react-native";
import { useCachedFetch } from "@/features/encyclopedia/useCachedFetch";

describe("useCachedFetch", () => {
	it("loads, then serves the next screens from memory", async () => {
		const fetcher = jest.fn(() => Promise.resolve(42));

		const first = await renderHook(() => useCachedFetch("count", fetcher));
		expect(first.result.current).toMatchObject({ status: "success", data: 42 });

		const second = await renderHook(() => useCachedFetch("count", fetcher));
		expect(second.result.current).toMatchObject({
			status: "success",
			data: 42,
		});
		expect(fetcher).toHaveBeenCalledTimes(1);
	});

	it("reports a failure without caching it, and loads again on retry", async () => {
		const fetcher = jest
			.fn()
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValueOnce("plants");

		const { result } = await renderHook(() =>
			useCachedFetch("failing", fetcher),
		);
		expect(result.current.status).toBe("error");

		await act(async () => result.current.retry());

		expect(result.current).toMatchObject({ status: "success", data: "plants" });
	});

	it("loads again when the key changes, like another tab", async () => {
		const fetcher = jest.fn((key: string) => Promise.resolve(key));
		const { result, rerender } = await renderHook(
			({ key }: { key: string }) => useCachedFetch(key, () => fetcher(key)),
			{ initialProps: { key: "a" } },
		);

		await rerender({ key: "b" });

		expect(result.current.data).toBe("b");
	});

	it("keeps the failure of the new key when the old one answers late", async () => {
		let answerOld = (_: string) => {};
		const fetchers: Record<string, () => Promise<string>> = {
			old: () =>
				new Promise((resolve) => {
					answerOld = resolve;
				}),
			new: () => Promise.reject(new Error("offline")),
		};
		const { result, rerender } = await renderHook(
			({ key }: { key: string }) => useCachedFetch(key, fetchers[key]),
			{ initialProps: { key: "old" } },
		);

		await rerender({ key: "new" });
		await act(async () => answerOld("late"));

		expect(result.current.status).toBe("error");
	});
});
