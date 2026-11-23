import { useCallback, useEffect, useState } from "react";

type FetchState<T> = {
	status: "loading" | "success" | "error";
	data: T | null;
};

// The encyclopedia data barely changes: kept for the session, so tabs and screens reopen instantly
const cache = new Map<string, unknown>();

export const useCachedFetch = <T>(key: string, fetcher: () => Promise<T>) => {
	const cached = () =>
		cache.has(key)
			? { status: "success" as const, data: cache.get(key) as T }
			: { status: "loading" as const, data: null };
	const [state, setState] = useState<FetchState<T> & { key: string }>(() => ({
		...cached(),
		key,
	}));
	const [attempt, setAttempt] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: the key names what fetcher loads, and attempt reruns a failed load
	useEffect(() => {
		if (cache.has(key)) {
			setState({ ...cached(), key });
			return;
		}
		setState({ status: "loading", data: null, key });
		let current = true;
		fetcher()
			.then((data) => {
				cache.set(key, data);
				if (current) setState({ status: "success", data, key });
			})
			.catch(() => current && setState({ status: "error", data: null, key }));
		return () => {
			current = false;
		};
	}, [key, attempt]);

	const retry = useCallback(() => setAttempt((count) => count + 1), []);

	// Until the effect catches up, a new key shows as loading rather than the previous data
	const { key: stateKey, ...rest } = state;
	return { ...(stateKey === key ? rest : cached()), retry };
};
