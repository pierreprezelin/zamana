import { z } from "zod";
import type { IoniconsIconName } from "@/components/ionicons";
import { normalizeForSearch } from "@/utils/search";

export const ARTICLE_CATEGORIES = [
	"basics",
	"watering",
	"light",
	"seasons",
	"propagation",
	"health",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const categoryIcons: Record<ArticleCategory, IoniconsIconName> = {
	basics: "book-outline",
	watering: "water-outline",
	light: "sunny-outline",
	seasons: "calendar-outline",
	propagation: "cut-outline",
	health: "medkit-outline",
};

// Bounds far above the real articles, so a broken site can't bloat the app storage
const MAX_ARTICLES = 500;

const articleSchema = z.object({
	// Used as a route segment
	slug: z.string().regex(/^[a-z0-9-]{1,100}$/),
	title: z.string().min(1).max(200),
	category: z.enum(ARTICLE_CATEGORIES),
	body: z.string().max(50_000),
});

export type Article = z.infer<typeof articleSchema>;

// The site is outside the app: what it sends is checked before being shown or saved.
// One article in a newer format (a category this version doesn't know) is skipped, not the whole list
export const parseArticles = (data: unknown): Article[] =>
	z
		.array(z.unknown())
		.max(MAX_ARTICLES)
		.parse(data)
		.flatMap((item) => {
			const parsed = articleSchema.safeParse(item);
			return parsed.success ? [parsed.data] : [];
		});

export const countByCategory = (articles: Article[]) =>
	Object.fromEntries(
		ARTICLE_CATEGORIES.map((category) => [
			category,
			articles.filter((article) => article.category === category).length,
		]),
	) as Record<ArticleCategory, number>;

export const searchArticles = (articles: Article[], query: string) => {
	const needle = normalizeForSearch(query.trim());
	if (!needle) return articles;
	const inTitle = articles.filter((article) =>
		normalizeForSearch(article.title).includes(needle),
	);
	const inBody = articles.filter(
		(article) =>
			!inTitle.includes(article) &&
			normalizeForSearch(article.body).includes(needle),
	);
	return [...inTitle, ...inBody];
};
