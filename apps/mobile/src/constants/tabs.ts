import type { IoniconsIconName } from "@/components/ionicons";
import { t } from "@/utils/i18n";

type Tab = {
	name: string;
	href: "/" | "/garden" | "/encyclopedia" | "/tips";
	label: string;
	icon: { default: IoniconsIconName; selected: IoniconsIconName };
};

export const tabs: Tab[] = [
	{
		name: "index",
		href: "/",
		label: t("tabs.today"),
		icon: { default: "calendar-outline", selected: "calendar" },
	},
	{
		name: "garden",
		href: "/garden",
		label: t("tabs.garden"),
		icon: { default: "leaf-outline", selected: "leaf" },
	},
	{
		name: "encyclopedia",
		href: "/encyclopedia",
		label: t("tabs.encyclopedia"),
		icon: { default: "search-outline", selected: "search" },
	},
	{
		name: "tips",
		href: "/tips",
		label: t("tabs.tips"),
		icon: { default: "bookmarks-outline", selected: "bookmarks" },
	},
];
