const palette = require("./src/constants/palette");

const tokens = Object.keys(palette);

const toRgbChannels = (hex) =>
	[1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16)).join(" ");

const cssVariables = (scheme) =>
	Object.fromEntries(
		tokens.map((token) => [
			`--color-${token}`,
			toRgbChannels(palette[token][scheme]),
		]),
	);

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: Object.fromEntries(
				tokens.map((token) => [
					token,
					`rgb(var(--color-${token}) / <alpha-value>)`,
				]),
			),
			fontFamily: {
				outfit: ["Outfit-Regular"],
				"outfit-semibold": ["Outfit-SemiBold"],
				recoleta: ["Recoleta-SemiBold"],
			},
		},
	},
	plugins: [
		({ addBase }) =>
			addBase({
				":root": cssVariables("light"),
				"@media (prefers-color-scheme: dark)": {
					":root": cssVariables("dark"),
				},
			}),
	],
};
