// @ts-check

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
	site: "https://zamana.garden",
	i18n: { defaultLocale: "fr", locales: ["fr", "en"] },
	integrations: [icon()],
	vite: {
		plugins: [tailwindcss()],
		// The hoisted linker exposes Express's cookie@0 at the root, Astro needs its own cookie@2
		resolve: { noExternal: ["cookie"] },
	},
});
