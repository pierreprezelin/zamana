// A background task has about 30 seconds: a silent service must not use them up
const TIMEOUT_MS = 10_000;

export const getJson = async (
	url: string,
	params: Record<string, string> = {},
	headers: Record<string, string> = {},
) => {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		const query = new URLSearchParams(params).toString();
		const response = await fetch(query ? `${url}?${query}` : url, {
			signal: controller.signal,
			headers,
		});
		if (!response.ok) {
			throw new Error(`${url} answered ${response.status}`);
		}
		return (await response.json()) as unknown;
	} finally {
		clearTimeout(timer);
	}
};
