import i18next from "i18next";
import { appLanguage } from "@/features/language/useLanguageStore";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

// Synchronous so the modules importing t can translate at load time.
i18next.init({
	lng: appLanguage(),
	fallbackLng: "en",
	resources: { fr: { translation: fr }, en: { translation: en } },
	initAsync: false,
	interpolation: { escapeValue: false },
});

export { t } from "i18next";

export const locale = () => i18next.language;

// To fit a label in a sentence, without lowercasing an English month
export const lowerFirst = (text: string) =>
	`${text.charAt(0).toLocaleLowerCase(locale())}${text.slice(1)}`;

// Hermes lacks Intl.PluralRules, which i18next plurals rely on. French keeps 0 singular, English does not
export const pluralForm = (amount: number) =>
	amount === 1 || (amount === 0 && locale() === "fr") ? "one" : "other";
