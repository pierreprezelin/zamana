import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import type { Article } from "@/features/articles/articles";
import {
	articlesAvailability,
	useArticleStore,
} from "@/features/articles/useArticleStore";
import type { Language } from "@/features/language/useLanguageStore";
import { locale } from "@/utils/i18n";

const NO_ARTICLES: Article[] = [];

// The articles in the app language, refreshed when a screen showing them gets focus
export const useArticles = () => {
	const language = locale() as Language;
	const articles = useArticleStore(
		(state) => state.articles[language] ?? NO_ARTICLES,
	);
	const status = useArticleStore((state) => state.status[language]);
	const fetched = useArticleStore((state) => !!state.fetchedAt[language]);
	const refresh = useArticleStore((state) => state.refresh);
	const refreshIfStale = useArticleStore((state) => state.refreshIfStale);

	useFocusEffect(
		useCallback(() => {
			refreshIfStale(language);
		}, [refreshIfStale, language]),
	);

	return {
		articles,
		availability: articlesAvailability(articles, status, fetched),
		retry: () => refresh(language),
	};
};
