import i18next from "i18next";
import fr from "@/locales/fr.json";

// Synchronous so the modules importing t can translate at load time.
// ponytail: language fixed to French at launch; detect the device locale (and reload on change, Android does not restart the app) when English lands
i18next.init({
	lng: "fr",
	resources: { fr: { translation: fr } },
	initAsync: false,
	interpolation: { escapeValue: false },
});

export { t } from "i18next";

export const locale = () => i18next.language;

// Hermes lacks Intl.PluralRules, which i18next plurals rely on. Right for French and English from 1 on
export const pluralForm = (amount: number) => (amount > 1 ? "other" : "one");
