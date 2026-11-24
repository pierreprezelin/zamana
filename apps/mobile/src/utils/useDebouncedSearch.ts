import { useCallback, useEffect, useState } from "react";

// Shared by every search sent to a web service, so they all feel the same
export const SEARCH_DELAY_MS = 400;
export const SEARCH_MIN_LENGTH = 2;

type SearchStatus = "idle" | "loading" | "success" | "error";

type SearchState<T> = {
	status: SearchStatus;
	result: T | null;
	// Lags behind the typed query until its own result arrives
	resultQuery: string | null;
};

export const useDebouncedSearch = <T>(
	query: string,
	search: (query: string) => Promise<T>,
) => {
	const [state, setState] = useState<SearchState<T>>({
		status: "idle",
		result: null,
		resultQuery: null,
	});
	const [attempt, setAttempt] = useState(0);
	const trimmed = query.trim();

	// biome-ignore lint/correctness/useExhaustiveDependencies: attempt reruns a failed search, and search is a module function
	useEffect(() => {
		if (trimmed.length < SEARCH_MIN_LENGTH) {
			setState({ status: "idle", result: null, resultQuery: null });
			return;
		}
		setState((current) =>
			current.status === "loading"
				? current
				: { ...current, status: "loading" },
		);
		let current = true;
		const timer = setTimeout(() => {
			search(trimmed)
				.then(
					(result) =>
						current &&
						setState({ status: "success", result, resultQuery: trimmed }),
				)
				.catch(
					() =>
						current &&
						setState({ status: "error", result: null, resultQuery: null }),
				);
		}, SEARCH_DELAY_MS);
		return () => {
			current = false;
			clearTimeout(timer);
		};
	}, [trimmed, attempt]);

	const retry = useCallback(() => setAttempt((count) => count + 1), []);

	return { ...state, query: trimmed, retry };
};
