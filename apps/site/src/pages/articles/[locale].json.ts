import { getCollection } from "astro:content";
import type { APIRoute, GetStaticPaths } from "astro";
import type { Locale } from "@/i18n";

export const getStaticPaths = (() =>
	(["fr", "en"] satisfies Locale[]).map((locale) => ({
		params: { locale },
	}))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
	const prefix = `${params.locale}/`;
	const articles = await getCollection("articles", ({ id }) =>
		id.startsWith(prefix),
	);

	return Response.json(
		articles.map(({ id, data, body }) => ({
			slug: id.slice(prefix.length),
			...data,
			body: body?.trim() ?? "",
		})),
	);
};
