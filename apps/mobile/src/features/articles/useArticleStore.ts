import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Article, parseArticles } from "@/features/articles/articles";
import { fetchArticles } from "@/features/articles/fetchArticles";
import type { Language } from "@/features/language/useLanguageStore";
import { syncStorage } from "@/utils/syncStorage";

// New articles are published on the site, without an app update
const REFRESH_AFTER_MS = 24 * 3_600_000;

type FetchStatus = "idle" | "loading" | "error";

export type ArticlesAvailability = "ready" | "loading" | "error" | "empty";

// Saved articles are shown even when the refresh fails
export const articlesAvailability = (
	articles: Article[],
	status: FetchStatus | undefined,
	fetched: boolean,
): ArticlesAvailability => {
	if (articles.length) return "ready";
	if (status === "error") return "error";
	if (fetched && status !== "loading") return "empty";
	return "loading";
};

type ArticleState = {
	articles: Partial<Record<Language, Article[]>>;
	fetchedAt: Partial<Record<Language, string>>;
	status: Partial<Record<Language, FetchStatus>>;
	refresh: (language: Language, now?: Date) => Promise<void>;
	refreshIfStale: (language: Language, now?: Date) => Promise<void>;
};

type SavedArticles = Pick<ArticleState, "articles" | "fetchedAt">;

const LANGUAGES: Language[] = ["fr", "en"];

const readableList = (articles: unknown) => {
	try {
		return parseArticles(articles);
	} catch {
		return [];
	}
};

// A language without any readable saved article is dropped, and fetched again
const readableArticles = (saved: Partial<SavedArticles> | undefined) => {
	const result: SavedArticles = { articles: {}, fetchedAt: {} };
	for (const language of LANGUAGES) {
		const articles = readableList(saved?.articles?.[language]);
		const fetchedAt = saved?.fetchedAt?.[language];
		if (!articles.length || !fetchedAt) continue;
		result.articles[language] = articles;
		result.fetchedAt[language] = fetchedAt;
	}
	return result;
};

export const useArticleStore = create<ArticleState>()(
	persist(
		(set, get) => ({
			articles: {},
			fetchedAt: {},
			status: {},
			refresh: async (language, now = new Date()) => {
				const setStatus = (status: FetchStatus) =>
					set((state) => ({ status: { ...state.status, [language]: status } }));
				setStatus("loading");
				try {
					const articles = await fetchArticles(language);
					set((state) => ({
						articles: { ...state.articles, [language]: articles },
						fetchedAt: { ...state.fetchedAt, [language]: now.toISOString() },
						status: { ...state.status, [language]: "idle" },
					}));
				} catch {
					// The saved articles stay readable offline
					setStatus("error");
				}
			},
			refreshIfStale: async (language, now = new Date()) => {
				// Every screen showing articles asks on focus
				if (get().status[language] === "loading") return;
				const fetchedAt = get().fetchedAt[language];
				const age = fetchedAt
					? now.getTime() - new Date(fetchedAt).getTime()
					: Number.POSITIVE_INFINITY;
				if (age > REFRESH_AFTER_MS) await get().refresh(language, now);
			},
		}),
		{
			name: "articles",
			storage: syncStorage,
			partialize: ({ articles, fetchedAt }) => ({ articles, fetchedAt }),
			merge: (persisted, current) => ({
				...current,
				...readableArticles(persisted as Partial<SavedArticles>),
			}),
		},
	),
);
