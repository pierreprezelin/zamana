import { Storage } from "expo-sqlite/kv-store";
import type { Article } from "@/features/articles/articles";
import { fetchArticles } from "@/features/articles/fetchArticles";

jest.mock("@/features/articles/fetchArticles", () => ({
	fetchArticles: jest.fn(),
}));

const { articlesAvailability, useArticleStore } =
	require("@/features/articles/useArticleStore") as typeof import("@/features/articles/useArticleStore");

const article: Article = {
	slug: "thirsty-plant",
	title: "Comment savoir si ma plante a soif ?",
	category: "watering",
	body: "Enfoncez un doigt dans le terreau.",
};

const now = new Date("2026-11-22T10:00:00Z");
const hoursAgo = (hours: number) =>
	new Date(now.getTime() - hours * 3_600_000).toISOString();

beforeEach(() => {
	jest.mocked(fetchArticles).mockReset();
	useArticleStore.setState({ articles: {}, fetchedAt: {}, status: {} });
});

describe("useArticleStore", () => {
	it("saves the articles of a language", async () => {
		jest.mocked(fetchArticles).mockResolvedValue([article]);

		await useArticleStore.getState().refresh("fr", now);

		const state = useArticleStore.getState();
		expect(fetchArticles).toHaveBeenCalledWith("fr");
		expect(state.articles.fr).toEqual([article]);
		expect(state.fetchedAt.fr).toBe(now.toISOString());
		expect(state.status.fr).toBe("idle");
		expect(Storage.getItemSync("articles")).toContain("thirsty-plant");
	});

	it("keeps the saved articles when the site can't be reached", async () => {
		useArticleStore.setState({ articles: { fr: [article] } });
		jest.mocked(fetchArticles).mockRejectedValue(new Error("offline"));

		await useArticleStore.getState().refresh("fr", now);

		const state = useArticleStore.getState();
		expect(state.articles.fr).toEqual([article]);
		expect(state.status.fr).toBe("error");
	});

	it.each([
		["never fetched", undefined, true],
		["fetched a day ago", hoursAgo(25), true],
		["fetched an hour ago", hoursAgo(1), false],
	])("refreshes when %s: %p", async (_, fetchedAt, expected) => {
		useArticleStore.setState({ fetchedAt: fetchedAt ? { fr: fetchedAt } : {} });
		jest.mocked(fetchArticles).mockResolvedValue([article]);

		await useArticleStore.getState().refreshIfStale("fr", now);

		expect(jest.mocked(fetchArticles).mock.calls.length > 0).toBe(expected);
	});

	it("doesn't fetch again while a fetch is running", async () => {
		jest.mocked(fetchArticles).mockResolvedValue([article]);

		await Promise.all([
			useArticleStore.getState().refreshIfStale("fr", now),
			useArticleStore.getState().refreshIfStale("fr", now),
		]);

		expect(fetchArticles).toHaveBeenCalledTimes(1);
	});

	it("still fetches a language while another one is loading", async () => {
		useArticleStore.setState({ status: { fr: "loading" } });
		jest.mocked(fetchArticles).mockResolvedValue([article]);

		await useArticleStore.getState().refreshIfStale("en", now);

		expect(fetchArticles).toHaveBeenCalledWith("en");
	});

	it("only fetches the languages it is asked for", async () => {
		useArticleStore.setState({ fetchedAt: { fr: hoursAgo(1) } });
		jest.mocked(fetchArticles).mockResolvedValue([article]);

		await useArticleStore.getState().refreshIfStale("en", now);

		expect(fetchArticles).toHaveBeenCalledWith("en");
	});

	it("keeps the readable saved articles of a language", () => {
		Storage.setItemSync(
			"articles",
			JSON.stringify({
				state: {
					articles: { fr: [article, { slug: "broken" }] },
					fetchedAt: { fr: hoursAgo(1) },
				},
				version: 0,
			}),
		);

		useArticleStore.persist.rehydrate();

		expect(useArticleStore.getState().articles).toEqual({ fr: [article] });
	});

	it("drops unreadable saved articles on launch", () => {
		Storage.setItemSync(
			"articles",
			JSON.stringify({
				state: {
					articles: { fr: [{ slug: "broken" }], en: [article] },
					fetchedAt: { fr: hoursAgo(1), en: hoursAgo(1) },
				},
				version: 0,
			}),
		);

		useArticleStore.persist.rehydrate();

		const state = useArticleStore.getState();
		expect(state.articles).toEqual({ en: [article] });
		// Fetched again at the next opening
		expect(state.fetchedAt).toEqual({ en: hoursAgo(1) });
	});
});

describe("articlesAvailability", () => {
	it.each([
		[
			"saved articles, even if the refresh failed",
			[article],
			"error",
			false,
			"ready",
		],
		["nothing saved and never fetched", [], undefined, false, "loading"],
		["nothing saved and a fetch running", [], "loading", false, "loading"],
		["nothing saved and the fetch failed", [], "error", false, "error"],
		["a fetch that brought no article", [], "idle", true, "empty"],
		["an empty list being refreshed", [], "loading", true, "loading"],
	] as const)("is %s", (_, articles, status, fetched, expected) => {
		expect(articlesAvailability([...articles], status, fetched)).toBe(expected);
	});
});
