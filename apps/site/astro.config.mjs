// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	vite: {
		// The hoisted linker exposes Express's cookie@0 at the root, Astro needs its own cookie@2
		resolve: { noExternal: ["cookie"] },
	},
});
