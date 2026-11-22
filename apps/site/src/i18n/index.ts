import en from "./en.json";
import fr from "./fr.json";

export type Dictionary = typeof fr;

const dictionaries = { fr, en } satisfies Record<string, Dictionary>;

export type Locale = keyof typeof dictionaries;

export const defaultLocale: Locale = "fr";

export const indexedLocales: Locale[] = ["fr", "en"];

export const getDictionary = (locale: Locale) => dictionaries[locale];

export const privacyPaths: Record<Locale, string> = {
	fr: "confidentialite",
	en: "privacy",
};
