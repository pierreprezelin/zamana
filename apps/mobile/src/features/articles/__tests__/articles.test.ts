import {
	type Article,
	countByCategory,
	parseArticles,
	searchArticles,
} from "@/features/articles/articles";

const article = (overrides: Partial<Article>): Article => ({
	slug: "thirsty-plant",
	title: "Comment savoir si ma plante a soif ?",
	category: "watering",
	body: "Enfoncez un doigt dans le terreau.",
	...overrides,
});

describe("parseArticles", () => {
	it("accepts the articles published by the site", () => {
		const articles = [article({}), article({ slug: "b", category: "health" })];

		expect(parseArticles(articles)).toEqual(articles);
	});

	it.each([
		["an unknown category", { category: "recipes" }],
		["a missing body", { body: undefined }],
		["a slug that is not a plain route segment", { slug: "../settings" }],
		["an oversized body", { body: "a".repeat(50_001) }],
	])("skips an article with %s, keeping the others", (_, overrides) => {
		const valid = article({ slug: "valid" });

		expect(parseArticles([valid, { ...article({}), ...overrides }])).toEqual([
			valid,
		]);
	});

	it.each([
		["something else than a list", { articles: [] }],
		["far too many articles", Array.from({ length: 501 }, () => article({}))],
	])("rejects %s", (_, input) => {
		expect(() => parseArticles(input)).toThrow();
	});
});

describe("countByCategory", () => {
	it("counts the articles of every category, empty ones included", () => {
		expect(
			countByCategory([
				article({ category: "watering" }),
				article({ category: "watering" }),
				article({ category: "health" }),
			]),
		).toEqual({
			basics: 0,
			watering: 2,
			light: 0,
			seasons: 0,
			propagation: 0,
			health: 1,
		});
	});
});

describe("searchArticles", () => {
	const articles = [
		article({ slug: "thirsty", title: "Comment savoir si ma plante a soif ?" }),
		article({
			slug: "light",
			title: "Lumière directe ou indirecte ?",
			category: "light",
			body: "Une fenêtre orientée au sud.",
		}),
	];

	it("returns every article for an empty query", () => {
		expect(searchArticles(articles, "  ")).toEqual(articles);
	});

	it("finds a word in the title, ignoring accents and case", () => {
		expect(searchArticles(articles, "LUMIERE").map(({ slug }) => slug)).toEqual(
			["light"],
		);
	});

	it("finds a word in the body", () => {
		expect(searchArticles(articles, "fenetre").map(({ slug }) => slug)).toEqual(
			["light"],
		);
	});

	it("puts title matches before body matches", () => {
		const both = [
			article({ slug: "body", body: "Arrosez au terreau sec." }),
			article({ slug: "title", title: "Arroser en hiver", body: "Moins." }),
		];

		expect(searchArticles(both, "arros").map(({ slug }) => slug)).toEqual([
			"title",
			"body",
		]);
	});
});
