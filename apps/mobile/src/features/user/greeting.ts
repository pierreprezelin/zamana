import { t } from "@/utils/i18n";

const salutation = (hour: number) => {
	if (hour < 5) return t("today.greeting.night");
	if (hour < 12) return t("today.greeting.morning");
	if (hour < 18) return t("today.greeting.afternoon");
	return t("today.greeting.evening");
};

export const greeting = (hour: number, name: string | null) =>
	`${salutation(hour)}${name ? `, ${name}` : ""} 👋`;
