import en from "./en.json";
import fr from "./fr.json";

export type Dictionary = typeof fr;

const dictionaries = { fr, en } satisfies Record<string, Dictionary>;

export type Locale = keyof typeof dictionaries;

export const defaultLocale: Locale = "fr";

// English is built but not linked nor indexed until the app screenshots exist in English
export const indexedLocales: Locale[] = ["fr"];

export const getDictionary = (locale: Locale) => dictionaries[locale];

export const privacyPaths: Record<Locale, string> = {
	fr: "confidentialite",
	en: "privacy",
};
