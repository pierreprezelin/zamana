import { parseArticles } from "@/features/articles/articles";
import type { Language } from "@/features/language/useLanguageStore";
import { getJson } from "@/utils/getJson";

const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? "https://zamana.garden";

export const fetchArticles = async (language: Language) =>
	parseArticles(await getJson(`${SITE_URL}/articles/${language}.json`));
