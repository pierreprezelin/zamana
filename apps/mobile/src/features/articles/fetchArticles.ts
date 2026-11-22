import { parseArticles } from "@/features/articles/articles";
import type { Language } from "@/features/language/useLanguageStore";

const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? "https://zamana.garden";
const TIMEOUT_MS = 10_000;

export const fetchArticles = async (language: Language) => {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		const response = await fetch(`${SITE_URL}/articles/${language}.json`, {
			signal: controller.signal,
		});
		if (!response.ok) {
			throw new Error(`The site answered ${response.status}`);
		}
		return parseArticles(await response.json());
	} finally {
		clearTimeout(timer);
	}
};
