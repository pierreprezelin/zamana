import { extendTailwindMerge } from "tailwind-merge";

// The theme's title sizes carry their own line height, so they replace the default one
export const twMerge = extendTailwindMerge<"title-size">({
	extend: {
		classGroups: {
			"title-size": [{ text: ["page-title", "section-title", "card-title"] }],
		},
		conflictingClassGroups: { "title-size": ["font-size", "leading"] },
	},
});
