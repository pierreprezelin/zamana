// Lowercase and without accents, so "lumiere" finds "Lumière"
export const normalizeForSearch = (text: string) =>
	text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
