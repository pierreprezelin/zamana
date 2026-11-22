import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// A translation shares its file name with the original, in the folder of its locale
const articles = defineCollection({
	loader: glob({ pattern: "{fr,en}/*.md", base: "./src/content/articles" }),
	schema: z.object({
		title: z.string(),
		category: z.enum(["basics", "watering", "light", "pests"]),
	}),
});

export const collections = { articles };
