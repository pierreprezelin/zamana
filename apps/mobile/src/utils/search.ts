// Lowercase, without accents nor ligatures, so "lumiere" finds "Lumière" and "coeur" "cœur"
export const normalizeForSearch = (text: string) =>
	text
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replaceAll("œ", "oe")
		.replaceAll("æ", "ae");
