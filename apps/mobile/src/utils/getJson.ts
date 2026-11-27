// A background task has about 30 seconds: a silent service must not use them up
const TIMEOUT_MS = 10_000;

export const fetchWithTimeout = async (
	input: string | URL | Request,
	init: RequestInit = {},
	timeoutMs = TIMEOUT_MS,
) => {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		return await fetch(input, { ...init, signal: controller.signal });
	} finally {
		clearTimeout(timer);
	}
};

export const getJson = async (
	url: string,
	params: Record<string, string> = {},
	headers: Record<string, string> = {},
) => {
	const query = new URLSearchParams(params).toString();
	const response = await fetchWithTimeout(query ? `${url}?${query}` : url, {
		headers,
	});
	if (!response.ok) {
		throw new Error(`${url} answered ${response.status}`);
	}
	return (await response.json()) as unknown;
};
